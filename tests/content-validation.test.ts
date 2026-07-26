import { describe, expect, it } from "vitest";
import {
  ContentValidationError,
  content,
  getVisibleProjects,
  validatePortfolioContent,
} from "../src/lib/content";

function validInput() {
  return {
    site: structuredClone(content.site),
    projects: structuredClone(content.projects),
    skills: structuredClone(content.skills),
    timeline: structuredClone(content.timeline),
    socials: structuredClone(content.socials),
    navigation: structuredClone(content.navigation),
  };
}

describe("portfolio content validation", () => {
  it("accepts the production content", () => {
    expect(() => validatePortfolioContent(validInput())).not.toThrow();
  });

  it("reports duplicate project IDs and slugs", () => {
    const input = validInput();
    input.projects.push(structuredClone(input.projects[0]));

    expect(() => validatePortfolioContent(input)).toThrow(
      ContentValidationError,
    );
    expect(() => validatePortfolioContent(input)).toThrow(/duplicate value/);
  });

  it("rejects a featured hidden project", () => {
    const input = validInput();
    input.projects[0].visibility = "hidden";

    expect(() => validatePortfolioContent(input)).toThrow(
      /featured project cannot be hidden/i,
    );
  });

  it("rejects an image without alt text", () => {
    const input = validInput();
    input.projects[0].thumbnail = "/images/projects/example.webp";
    input.projects[0].thumbnailAlt = null;

    expect(() => validatePortfolioContent(input)).toThrow(
      /alt text is required/i,
    );
  });

  it("accepts missing optional links and images", () => {
    const input = validInput();
    input.projects[0].thumbnail = null;
    input.projects[0].thumbnailAlt = null;
    input.projects[0].links = {
      github: null,
      demo: null,
      documentation: null,
    };

    expect(() => validatePortfolioContent(input)).not.toThrow();
  });

  it("hides drafts in production and includes them explicitly in development", () => {
    const production = getVisibleProjects(content.projects);
    const development = getVisibleProjects(content.projects, true);

    expect(production.some((project) => project.visibility === "draft")).toBe(
      false,
    );
    expect(development.some((project) => project.visibility === "draft")).toBe(
      true,
    );
  });

  it("supports an empty project list", () => {
    const input = validInput();
    input.projects = [];
    input.timeline = [];

    expect(validatePortfolioContent(input).projects).toEqual([]);
  });
});
