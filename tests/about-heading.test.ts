import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const aboutPage = readFileSync("src/pages/about.astro", "utf8");
const globalCss = readFileSync("src/styles/global.css", "utf8");

describe("about page heading hierarchy", () => {
  it("uses the shared section-heading scale for the working-style title", () => {
    expect(aboutPage).toMatch(
      /<SectionHeading\s+eyebrow="Working style"\s+title="Practical curiosity, tested physically\."\s*\/>/s,
    );
    expect(globalCss).toMatch(
      /\.section-heading h2,[\s\S]*?font-size:\s*clamp\(2rem,\s*4vw,\s*3\.65rem\);[\s\S]*?line-height:\s*1\.08;/,
    );
    expect(globalCss).not.toContain(".about-heading");
  });
});
