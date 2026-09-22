import { describe, expect, it } from "vitest";
import { content } from "../src/lib/content";
import { filterProjects } from "../src/lib/filters";

describe("project filtering", () => {
  it("matches technologies and summary text", () => {
    expect(
      filterProjects(content.projects, { query: "CH32V006" }).map(
        (project) => project.slug,
      ),
    ).toContain("gigaplex");
    expect(
      filterProjects(content.projects, { query: "keychain" }).map(
        (project) => project.slug,
      ),
    ).toContain("gigaplex");
  });

  it("matches secondary categories", () => {
    const results = filterProjects(content.projects, {
      categories: ["pcb"],
    });
    expect(results.map((project) => project.slug)).toContain("gigaplex");
  });

  it("lists the finished Gigaplex build as completed", () => {
    const results = filterProjects(content.projects, {
      statuses: ["completed"],
    });

    expect(results.map((project) => project.slug)).toContain("gigaplex");
  });

  it("combines category and status filters", () => {
    const experimentalProject = {
      ...structuredClone(content.projects[0]),
      status: "experimental" as const,
    };
    const results = filterProjects([experimentalProject], {
      categories: ["pcb"],
      statuses: ["experimental"],
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (project) =>
          project.status === "experimental" &&
          [project.category, ...project.secondaryCategories].includes("pcb"),
      ),
    ).toBe(true);
  });

  it("handles long project titles", () => {
    const longTitleProject = {
      ...structuredClone(content.projects[0]),
      id: "long-title",
      slug: "long-title",
      title:
        "A deliberately long project title that still remains searchable and structurally valid",
    };

    expect(
      filterProjects([longTitleProject], { query: "structurally valid" }),
    ).toHaveLength(1);
  });

  it("returns an empty list for no matches", () => {
    expect(
      filterProjects(content.projects, {
        query: "definitely-not-a-project-technology",
      }),
    ).toEqual([]);
  });
});
