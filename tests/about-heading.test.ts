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
      /\.section-heading h2\s*\{[^}]*font-size:\s*clamp\([^;]+\);[^}]*line-height:/,
    );
    expect(globalCss).not.toContain(".about-heading");
  });

  it("presents the four working principles as one semantic list", () => {
    expect(aboutPage).toContain(
      '<ol class="working-method" aria-label="My working method">',
    );
    expect(aboutPage).toContain('<li class="working-method-item">');
    expect(aboutPage).not.toMatch(/principles-grid|class="principle"/);
    for (const description of [
      "Move an idea into a form that can be measured.",
      "Use failures to refine the model of the system.",
      "Check assumptions at electrical and physical boundaries.",
      "Keep the next revision simpler and more reliable.",
    ]) {
      expect(aboutPage).toContain(description);
    }
  });
});
