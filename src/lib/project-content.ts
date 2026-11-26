import type { ProjectContentBlock } from "../schemas/project";

interface ProjectSection {
  id?: string;
  title?: string;
  sketchpad?: boolean;
  blocks: ProjectContentBlock[];
}

export function getProjectSections(
  blocks: readonly ProjectContentBlock[],
  includeSketchpad = false,
): ProjectSection[] {
  let section: ProjectSection = { blocks: [] };
  const sections = [section];
  const usedIds = new Set(includeSketchpad ? ["specifications"] : []);
  let sketchpadAdded = false;

  for (const block of blocks) {
    if (block.type === "heading" && block.level === 2) {
      const baseId =
        block.title
          .toLowerCase()
          .match(/[a-z0-9]+/g)
          ?.join("-") || "section";
      let id = baseId;
      let suffix = 2;
      while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
      usedIds.add(id);
      section = { id, title: block.title, blocks: [] };
      sections.push(section);
    } else if (
      block.type === "specificationTable" &&
      includeSketchpad &&
      !sketchpadAdded
    ) {
      const title = "Specifications";
      section = {
        id: "specifications",
        title,
        sketchpad: true,
        blocks: [{ type: "heading", level: 2, title }],
      };
      sections.push(section);
      sketchpadAdded = true;
    }
    section.blocks.push(block);
  }

  return sections.filter((section) => section.blocks.length > 0);
}

export function getTimelineHeadingTag(
  blocks: readonly ProjectContentBlock[],
  index: number,
): "h2" | "h3" | "h4" {
  const previousBlock = blocks[index - 1];
  if (previousBlock?.type !== "heading") return "h2";
  return previousBlock.level === 2 ? "h3" : "h4";
}
