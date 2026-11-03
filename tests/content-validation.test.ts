import { describe, expect, it } from "vitest";
import {
  ContentValidationError,
  content,
  getExplorationItems,
  getVisibleProjects,
  validatePortfolioContent,
} from "../src/lib/content";
import type { ProjectContentBlock } from "../src/schemas/project";
import type { TimelineItem } from "../src/schemas/site";

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

  it("requires a valid URL and label for a project hero link", () => {
    const input = validInput();
    input.projects[0].heroLink = {
      label: "Watch the making process on YouTube",
      url: "https://www.youtube.com/watch?v=xjz5ZIe7dBw",
    };
    expect(() => validatePortfolioContent(input)).not.toThrow();

    input.projects[0].heroLink.url = "not a URL";
    expect(() => validatePortfolioContent(input)).toThrow(/heroLink\.url/i);
  });

  it.each(["/gigaplex/instruction-manual.pdf", "/documents/manual%2D2026.PDF"])(
    "accepts a local PDF hero download: %s",
    (url) => {
      const input = validInput();
      input.projects[0].heroDownload = {
        label: "Instruction manual (PDF)",
        url,
      };

      expect(() => validatePortfolioContent(input)).not.toThrow();
    },
  );

  it.each([
    "https://example.com/manual.pdf",
    "//example.com/manual.pdf",
    "manual.pdf",
    "/documents/manual.html",
    "/documents/../manual.pdf",
    "/documents/./manual.pdf",
    "/documents/%2e%2e/manual.pdf",
    "/documents/%252e%252e/manual.pdf",
    "/%2fexample.com/manual.pdf",
    "/documents/%2e%2e%2fmanual.pdf",
    "/documents\\manual.pdf",
    "/documents/manual.pdf?download=true",
    "/documents/manual.pdf#page=1",
    "/documents/manual.pdf%3Fdownload=true",
    "/documents/%00manual.pdf",
    "/documents/%invalid.pdf",
  ])("rejects an invalid PDF hero download path: %s", (url) => {
    const input = validInput();
    input.projects[0].heroDownload = {
      label: "Instruction manual (PDF)",
      url,
    };

    expect(() => validatePortfolioContent(input)).toThrow(/heroDownload\.url/i);
  });

  it("requires a nonempty PDF hero download label", () => {
    const input = validInput();
    input.projects[0].heroDownload = {
      label: " ",
      url: "/gigaplex/instruction-manual.pdf",
    };

    expect(() => validatePortfolioContent(input)).toThrow(
      /heroDownload\.label/i,
    );
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
    const repeatedCopy = structuredClone(input.projects[0]);
    repeatedCopy.id = "repeated-copy-test";
    repeatedCopy.slug = "repeated-copy-test";
    input.projects.push(repeatedCopy);

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

  it("accepts described photo placeholders and rejects an empty shot brief", () => {
    const input = validInput();
    const photoPlan: ProjectContentBlock = {
      type: "photoPlan",
      title: "Test photography",
      items: [
        {
          title: "Controller detail",
          description:
            "Photograph the controller at a shallow angle so the connector labels remain legible.",
          kind: "detail",
        },
      ],
    };
    input.projects[0].content.push(structuredClone(photoPlan));

    expect(() => validatePortfolioContent(input)).not.toThrow();

    const invalidPhotoPlan = structuredClone(photoPlan);
    if (invalidPhotoPlan.type !== "photoPlan") {
      throw new Error("Expected a photo-plan test fixture");
    }
    invalidPhotoPlan.items[0].description = "";
    input.projects[0].content.push(invalidPhotoPlan);
    expect(() => validatePortfolioContent(input)).toThrow(
      /description.*too small/i,
    );
  });

  it("accepts finite and ongoing project year ranges", () => {
    const input = validInput();
    input.projects[0].year = 2024;
    input.projects[0].yearEnd = 2026;
    expect(() => validatePortfolioContent(input)).not.toThrow();

    input.projects[0].year = 2025;
    input.projects[0].yearEnd = "Now";
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
    input.socials[0].url = "";
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

  it("omits exploration with no published project references", () => {
    const project = structuredClone(content.projects[0]);
    project.visibility = "draft";
    const item: TimelineItem = {
      id: "test-exploration",
      code: "EMB",
      title: "Test exploration",
      description: "A test thread linked to a project.",
      relatedProjects: [project.id],
    };

    expect(getExplorationItems([], [project])).toEqual([]);
    expect(getExplorationItems([item], [project])).toEqual([]);
    project.visibility = "hidden";
    expect(getExplorationItems([item], [project])).toEqual([]);
    expect(getExplorationItems([{ ...item, relatedProjects: [] }], [])).toEqual(
      [],
    );
  });

  it("preserves populated exploration and only its public references", () => {
    const published = structuredClone(content.projects[0]);
    published.visibility = "public";
    const draft = {
      ...structuredClone(published),
      id: "test-draft",
      visibility: "draft" as const,
    };
    const hidden = {
      ...structuredClone(published),
      id: "test-hidden",
      visibility: "hidden" as const,
    };
    const item: TimelineItem = {
      id: "test-exploration",
      code: "EMB",
      title: "Test exploration",
      description: "A test thread linked to a project.",
      relatedProjects: [draft.id, published.id, hidden.id],
    };

    expect(getExplorationItems([item], [published, draft, hidden])).toEqual([
      { ...item, relatedProjects: [published.id] },
    ]);
    expect(item.relatedProjects).toEqual([draft.id, published.id, hidden.id]);
  });
});
