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
    contact: structuredClone(content.contact),
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

  it("rejects repeated project narrative copy", () => {
    const input = validInput();
    input.projects[1].summary = input.projects[0].summary;

    expect(() => validatePortfolioContent(input)).toThrow(/projects\.copy/i);
  });

  it("rejects duplicated skills across groups", () => {
    const input = validInput();
    input.skills[1].skills.push(input.skills[0].skills[0]);

    expect(() => validatePortfolioContent(input)).toThrow(/skills\.entries/i);
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

  it("accepts finite and ongoing project year ranges", () => {
    const input = validInput();
    input.projects[0].year = 2024;
    input.projects[0].yearEnd = 2026;
    input.projects[1].year = 2025;
    input.projects[1].yearEnd = "Now";

    expect(() => validatePortfolioContent(input)).not.toThrow();
  });

  it("rejects a numeric end year before the start year", () => {
    const input = validInput();
    input.projects[0].year = 2026;
    input.projects[0].yearEnd = 2024;

    expect(() => validatePortfolioContent(input)).toThrow(
      /end year must be later than the start year/i,
    );
  });

  it("rejects the removed highlights field", () => {
    const input = validInput();
    Object.assign(input.projects[0], {
      highlights: ["This would duplicate the detail content"],
    });

    expect(() => validatePortfolioContent(input)).toThrow(
      /unrecognized key.*highlights/i,
    );
  });

  it("rejects legacy profile fields in site metadata", () => {
    const input = validInput();
    Object.assign(input.site, { github: "https://github.com/example" });

    expect(() => validatePortfolioContent(input)).toThrow(
      /site.*unrecognized key.*github/i,
    );
  });

  it("requires visible social profiles to have a URL", () => {
    const input = validInput();
    input.socials[0].visible = true;

    expect(() => validatePortfolioContent(input)).toThrow(
      /visible profile must have a URL/i,
    );
  });

  it("keeps the portfolio URL out of external profiles", () => {
    const input = validInput();
    input.socials[0].url = "https://www.itzsunboi.dev/";
    input.socials[0].visible = true;

    expect(() => validatePortfolioContent(input)).toThrow(
      /portfolio URL belongs only in site\.json/i,
    );
  });

  it("hides drafts in production and includes them explicitly in development", () => {
    const draft = structuredClone(content.projects[0]);
    draft.id = "visibility-test-draft";
    draft.slug = "visibility-test-draft";
    draft.featured = false;
    draft.visibility = "draft";
    const projects = [...content.projects, draft];
    const production = getVisibleProjects(projects);
    const development = getVisibleProjects(projects, true);

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
