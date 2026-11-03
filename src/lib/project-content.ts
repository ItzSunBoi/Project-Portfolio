import type { ProjectContentBlock } from "../schemas/project";

export function getTimelineHeadingTag(
  blocks: readonly ProjectContentBlock[],
  index: number,
): "h2" | "h3" | "h4" {
  const previousBlock = blocks[index - 1];
  if (previousBlock?.type !== "heading") return "h2";
  return previousBlock.level === 2 ? "h3" : "h4";
}
