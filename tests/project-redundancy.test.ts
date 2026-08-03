import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { content } from "../src/lib/content";

const detailTemplate = readFileSync(
  new URL("../src/pages/projects/[slug].astro", import.meta.url),
  "utf8",
);
const indexTemplate = readFileSync(
  new URL("../src/pages/projects/index.astro", import.meta.url),
  "utf8",
);
const fallbackArtwork = readFileSync(
  new URL(
    "../src/components/projects/BlueprintThumbnail.astro",
    import.meta.url,
  ),
  "utf8",
);
const filterScript = readFileSync(
  new URL("../src/scripts/project-filters.ts", import.meta.url),
  "utf8",
);

describe("project information hierarchy", () => {
  it("does not render category counts or a second highlights summary", () => {
    expect(detailTemplate).not.toMatch(
      /disciplines|project\.highlights|project\.technologies\.map/i,
    );
    expect(detailTemplate).not.toContain(">Highlights<");
  });

  it("keeps a single contextual filter reset control", () => {
    expect(indexTemplate.match(/data-clear-filters/g)).toHaveLength(1);
    expect(filterScript).toContain("button.hidden =");
  });

  it("keeps fallback artwork decorative instead of repeating card text", () => {
    expect(fallbackArtwork).not.toMatch(/PROJECT\s*\/\s*MODULE/i);
    expect(fallbackArtwork).not.toContain("{title}");
  });

  it("gives every specification grid and timeline its own concise title", () => {
    for (const project of content.projects) {
      for (const block of project.content) {
        if (
          block.type === "specificationTable" ||
          block.type === "timeline" ||
          block.type === "photoPlan"
        ) {
          expect(block.title.trim().length).toBeGreaterThan(0);
        }

        if (block.type === "photoPlan") {
          for (const item of block.items) {
            expect(item.title.trim().length).toBeGreaterThan(0);
            expect(item.description.trim().length).toBeGreaterThan(24);
          }
        }
      }
    }
  });

  it("keeps a described cover and supporting media plan for every project", () => {
    for (const project of content.projects) {
      const plannedPhotos = project.content.flatMap((block) =>
        block.type === "photoPlan" ? block.items : [],
      );

      expect(plannedPhotos.length, project.id).toBeGreaterThanOrEqual(6);
      expect(
        plannedPhotos.filter((item) => item.kind === "cover"),
        project.id,
      ).toHaveLength(1);
    }
  });
});
