import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { content } from "../src/lib/content";
import {
  ledColumns,
  ledPalette,
  ledPixelLabel,
  ledRows,
  ledStroke,
  nextLedPixel,
  sunHasPixel,
} from "../src/lib/led-sketchpad";
import { responsiveSrcSet } from "../src/lib/responsive-images";
import {
  getProjectSections,
  getTimelineHeadingTag,
} from "../src/lib/project-content";
import type { ProjectContentBlock } from "../src/schemas/project";

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
  new URL("../src/lib/project-filters.ts", import.meta.url),
  "utf8",
);
const homeTemplate = readFileSync(
  new URL("../src/pages/index.astro", import.meta.url),
  "utf8",
);
const featureTemplate = readFileSync(
  new URL("../src/components/hero/GigaplexFeature.astro", import.meta.url),
  "utf8",
);
const cardTemplate = readFileSync(
  new URL("../src/components/projects/ProjectCard.astro", import.meta.url),
  "utf8",
);

describe("project information hierarchy", () => {
  it("does not render category counts or a second highlights summary", () => {
    expect(detailTemplate).not.toMatch(
      /disciplines|project\.highlights|project\.technologies\.map/i,
    );
    expect(detailTemplate).not.toContain(">Highlights<");
  });

  it("places one PDF action ahead of the making video in the project hero", () => {
    const heroStart = detailTemplate.indexOf('<header class="project-hero">');
    const heroEnd = detailTemplate.indexOf("</header>", heroStart);
    const hero = detailTemplate.slice(heroStart, heroEnd);
    const subtitle = hero.indexOf("{project.subtitle}</p>");
    const pdfLink = hero.indexOf("href={project.heroDownload.url}");
    const videoLink = hero.indexOf("href={project.heroLink.url}");
    const metadata = hero.indexOf('class="project-hero-meta"');

    expect(subtitle).toBeGreaterThan(-1);
    expect(pdfLink).toBeGreaterThan(subtitle);
    expect(videoLink).toBeGreaterThan(pdfLink);
    expect(metadata).toBeGreaterThan(videoLink);
    expect(
      detailTemplate.match(/href=\{project\.heroDownload\.url\}/g),
    ).toHaveLength(1);
    expect(hero).toContain("project.heroDownload &&");
    expect(hero).toContain("{project.heroDownload.label}");
    expect(hero).toContain('type="application/pdf"');
    expect(hero).toContain('class="button button-primary"');
  });

  it("keeps the packaging QR destination connected to a real instruction PDF", () => {
    const project = content.projects.find((entry) => entry.id === "gigaplex");
    const download = project?.heroDownload;

    expect(download).toBeDefined();
    expect(download!.label).toMatch(/\bPDF\b/);
    const manual = readFileSync(
      new URL(`../public${download!.url}`, import.meta.url),
    );
    expect(manual.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("keeps a single contextual filter reset control", () => {
    expect(indexTemplate.match(/data-clear-filters/g)).toHaveLength(1);
    expect(filterScript).toContain("button.disabled =");
  });

  it("sizes featured and browsed collections from their rendered item counts", () => {
    expect(homeTemplate).toContain(
      "data-project-count={otherFeaturedProjects.length}",
    );
    expect(indexTemplate).toContain("data-project-count={projects.length}");
    expect(indexTemplate).toContain("data-project-results");
  });

  it("keeps the featured project panel and action on the fixed highlight palette", () => {
    expect(featureTemplate).toContain("background: var(--project-highlight)");
    expect(featureTemplate).toContain("color: var(--project-highlight-text)");
    expect(featureTemplate).toContain(
      "--button-bg: var(--project-highlight-text)",
    );
    expect(featureTemplate).toContain("--focus: var(--project-highlight-text)");
  });

  it("renders every toolbox item as a semantic list item", () => {
    expect(homeTemplate).toMatch(/<ul\s+class="toolbox-tools"\s+role="list"/);
    expect(homeTemplate).toMatch(
      /group\.skills\.map\(\(skill, index\) => \(\s*<li>[\s\S]*?\{skill\}\s*<\/li>/,
    );
    expect(homeTemplate).not.toContain('class="skill-pill"');
    expect(homeTemplate).toContain('id="skills"');
  });

  it("conditions the entire exploration section on eligible entries", () => {
    expect(homeTemplate).toMatch(/explorationItems\.length > 0 &&/);
    expect(homeTemplate).toContain("explorationItems.map");
    expect(homeTemplate).not.toContain("content.timeline.map");
  });

  it("keeps the project photograph and text destinations accessible", () => {
    expect(cardTemplate).toContain(
      "aria-label={`View ${project.title} project`}",
    );
    expect(cardTemplate).toContain('alt={project.thumbnailAlt ?? ""}');
    expect(cardTemplate).toContain(
      'View project <span aria-hidden="true">→</span>',
    );
    expect(cardTemplate).not.toContain('tabindex="-1"');
  });

  it("offers ordinary GET submission and explains the static no-script fallback", () => {
    expect(indexTemplate).toContain('method="get"');
    expect(indexTemplate).toContain('action="/projects/"');
    expect(indexTemplate).toContain('type="submit"');
    expect(indexTemplate).toMatch(/Enable JavaScript to filter the\s+list/);
    expect(indexTemplate).toContain('headingAs="h2"');
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

  it("subordinates the build diary title without changing stored content", () => {
    const project = content.projects.find((entry) => entry.id === "gigaplex");
    expect(project).toBeDefined();
    const blocks = project!.content;
    const original = structuredClone(blocks);
    const timelineIndex = blocks.findIndex(
      (block) => block.type === "timeline",
    );

    expect(blocks[timelineIndex - 1]).toEqual({
      type: "heading",
      level: 2,
      title: "Build diary",
    });
    expect(getTimelineHeadingTag(blocks, timelineIndex)).toBe("h3");
    expect(blocks).toEqual(original);
  });

  it("keeps the full Gigaplex narrative and adds one sketchpad to specifications", () => {
    const project = content.projects.find((entry) => entry.id === "gigaplex")!;
    const sections = getProjectSections(project.content, true);
    const specifications = sections.find((section) => section.sketchpad)!;

    expect(sections.filter((section) => section.sketchpad)).toHaveLength(1);
    expect(specifications.id).toBe("specifications");
    expect(specifications.blocks[1].type).toBe("specificationTable");
    const originalBlocks = sections.flatMap((section) =>
      section.sketchpad ? section.blocks.slice(1) : section.blocks,
    );
    expect(originalBlocks).toEqual(project.content);
    expect(
      getProjectSections(project.content).some((section) => section.sketchpad),
    ).toBe(false);
  });

  it("retains introductory blocks and gives repeated section headings distinct anchors", () => {
    const intro: ProjectContentBlock = {
      type: "paragraph",
      body: "An introduction.",
    };
    const heading: ProjectContentBlock = {
      type: "heading",
      level: 2,
      title: "A repeated heading",
    };
    const sections = getProjectSections([intro, heading, heading]);

    expect(sections[0]).toEqual({ blocks: [intro] });
    expect(sections.map((section) => section.id)).toEqual([
      undefined,
      "a-repeated-heading",
      "a-repeated-heading-2",
    ]);
  });

  it("keeps standalone timelines at section level and nests under subheadings", () => {
    const timeline: ProjectContentBlock = {
      type: "timeline",
      title: "A build timeline",
      items: [{ title: "First step", body: "The first step." }],
    };
    expect(getTimelineHeadingTag([timeline], 0)).toBe("h2");
    expect(
      getTimelineHeadingTag(
        [{ type: "paragraph", body: "Introduction." }, timeline],
        1,
      ),
    ).toBe("h2");
    expect(
      getTimelineHeadingTag(
        [{ type: "heading", level: 3, title: "A nested section" }, timeline],
        1,
      ),
    ).toBe("h4");
  });

  it("keeps either real photos or a described media plan for every project", () => {
    for (const project of content.projects) {
      const plannedPhotos = project.content.flatMap((block) =>
        block.type === "photoPlan" ? block.items : [],
      );

      if (plannedPhotos.length === 0) {
        const photos = project.content.flatMap((block) => {
          if (block.type === "image") return [block.src];
          if (block.type === "gallery")
            return block.images.map((image) => image.src);
          return [];
        });
        expect(project.thumbnail, project.id).not.toBeNull();
        expect(photos.length, project.id).toBeGreaterThanOrEqual(3);
        for (const src of [project.thumbnail, ...photos]) {
          expect(existsSync(`public${src}`), src ?? project.id).toBe(true);
          for (const variant of responsiveSrcSet(src ?? "")?.split(", ") ??
            []) {
            const path = variant.split(" ")[0];
            expect(existsSync(`public${path}`), path).toBe(true);
          }
        }
        continue;
      }

      expect(plannedPhotos.length, project.id).toBeGreaterThanOrEqual(6);
      expect(
        plannedPhotos.filter((item) => item.kind === "cover"),
        project.id,
      ).toHaveLength(1);
    }
  });
});

describe("Gigaplex LED sketchpad", () => {
  it("offers six named colours and announces a lit pixel's colour with its coordinates", () => {
    expect(Object.values(ledPalette).map(({ label }) => label)).toEqual([
      "Green",
      "Gold",
      "Light Blue",
      "Dark Blue",
      "Purple",
      "White",
    ]);
    expect(ledPixelLabel(ledColumns * ledRows - 1, "light-blue")).toBe(
      "Row 11, column 15, Light Blue",
    );
    expect(ledPixelLabel(0, undefined)).toBe("Row 1, column 1");
  });

  it("fits the sun preset inside a 15 × 11 grid", () => {
    const pixels = Array.from({ length: ledColumns * ledRows }, (_, index) =>
      sunHasPixel(index),
    );

    expect(pixels).toHaveLength(165);
    expect(pixels[7]).toBe(true);
    expect(pixels[5 * ledColumns + 7]).toBe(true);
    expect(pixels[10 * ledColumns + 7]).toBe(true);
    expect(pixels[0]).toBe(false);
    expect(pixels.at(-1)).toBe(false);
  });

  it("moves keyboard focus within row and column edges and keeps Space for drawing", () => {
    expect(nextLedPixel(0, "ArrowLeft")).toBe(0);
    expect(nextLedPixel(14, "ArrowRight")).toBe(14);
    expect(nextLedPixel(2, "ArrowUp")).toBe(2);
    expect(nextLedPixel(154, "ArrowDown")).toBe(154);
    expect(nextLedPixel(2, "ArrowDown")).toBe(17);
    expect(nextLedPixel(17, "ArrowUp")).toBe(2);
    expect(nextLedPixel(17, " ")).toBeUndefined();
  });

  it("fills every intermediate cell on a fast pointer stroke", () => {
    expect(ledStroke(0, 4)).toEqual([1, 2, 3, 4]);
    expect(ledStroke(48, 0)).toEqual([32, 16, 0]);
    expect(ledStroke(15, 45)).toEqual([30, 45]);
    expect(ledStroke(33, 33)).toEqual([]);
  });
});
