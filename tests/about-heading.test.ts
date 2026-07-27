import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const aboutPage = readFileSync("src/pages/about.astro", "utf8");
const globalCss = readFileSync("src/styles/global.css", "utf8");

describe("about page heading hierarchy", () => {
  it("uses the shared section-heading scale for the working-style title", () => {
    expect(aboutPage).toContain(
      '<h2 class="about-heading">Practical curiosity, tested physically.</h2>',
    );
    expect(globalCss).toMatch(
      /\.about-heading\s*{[^}]*font-size:\s*clamp\(2rem,\s*4vw,\s*3\.65rem\);[^}]*line-height:\s*1\.08;/s,
    );
  });
});
