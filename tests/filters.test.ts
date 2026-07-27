import { describe, expect, it } from "vitest";
import { content } from "../src/lib/content";
import { filterProjects } from "../src/lib/filters";

describe("project filtering", () => {
  it("matches technologies and summary text", () => {
    const results = filterProjects(content.projects, { query: "OV9281" });
    expect(results.map((project) => project.slug)).toContain(
      "dual-laser-triangulator",
    );
  });

  it("matches secondary categories", () => {
    const results = filterProjects(content.projects, {
      categories: ["computer-vision"],
    });
    expect(results.map((project) => project.slug)).toContain("chroma-slicer");
  });

  it("combines category and status filters", () => {
    const results = filterProjects(content.projects, {
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
