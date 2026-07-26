import type { APIRoute, GetStaticPaths } from "astro";
import { getVisibleProjects } from "../../lib/content";
import type { Project } from "../../schemas/project";

export const getStaticPaths = (() =>
  getVisibleProjects().map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }))) satisfies GetStaticPaths;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapTitle(title: string) {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > 26 && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

export const GET: APIRoute = ({ props }) => {
  const project = props.project as Project;
  const titleLines = wrapTitle(project.title);
  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<text x="92" y="${296 + index * 82}" fill="#EFF8FF" font-family="Inter, Arial, sans-serif" font-size="70" font-weight="700" letter-spacing="-2">${escapeXml(line)}</text>`,
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#07131F"/>
  <g fill="none" stroke="#23445C" stroke-width="2" opacity=".8">
    <path d="M0 112h358l42 42h156M1200 490H860l-42-42H616"/>
    <path d="M94 0v180l42 42v142M1102 630V452l-42-42V265"/>
    <circle cx="400" cy="154" r="7" fill="#52B8FA"/>
    <circle cx="818" cy="448" r="7" fill="#52B8FA"/>
  </g>
  <g transform="translate(92 72)">
    <g fill="none" stroke="#FFD447" stroke-linecap="round" stroke-width="8">
      <path d="M52 0v16M52 88v16M0 52h16M88 52h16"/>
      <path d="m15 15 11 11M78 78l11 11M89 15 78 26M26 78 15 89"/>
    </g>
    <circle cx="52" cy="52" r="25" fill="#FFD447" stroke="#E9A900" stroke-width="3"/>
  </g>
  <text x="222" y="112" fill="#A8C0D2" font-family="ui-monospace, SFMono-Regular, monospace" font-size="24" letter-spacing="2">ITZSUNBOI / ${escapeXml(project.category.toUpperCase())}</text>
  ${titleMarkup}
  <text x="96" y="548" fill="#52B8FA" font-family="ui-monospace, SFMono-Regular, monospace" font-size="22" letter-spacing="2">${escapeXml(project.status.toUpperCase())} · ${project.year}</text>
  <rect x="92" y="576" width="1016" height="2" fill="#23445C"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
