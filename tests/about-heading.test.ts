import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getProjectBySlug } from "../src/lib/content";

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
    expect(aboutPage).toMatch(/<ol\s+class="working-method"/);
    expect(aboutPage).toContain('aria-label="My working method"');
    expect(aboutPage).toContain('<li class="working-method-item">');
    for (const [title, description] of [
      ["Build", "Make something I can measure."],
      ["Learn", "Use failures to refine my understanding of the system."],
      ["Test", "Check the electrical and mechanical assumptions."],
      ["Improve", "Keep the next revision simpler and more reliable."],
    ]) {
      expect(aboutPage).toContain(`"${title}"`);
      expect(aboutPage).toContain(description);
    }
  });

  it("uses the original assembly photograph and its project-owned description", () => {
    const photo = getProjectBySlug("gigaplex")
      ?.content.flatMap((block) =>
        block.type === "gallery" ? block.images : [],
      )
      .find(({ src }) => src.endsWith("/component-placement.webp"));

    expect(photo).toBeDefined();
    expect(existsSync(`public${photo?.src}`)).toBe(true);
    expect(aboutPage).toContain("src={workshopPhoto.src}");
    expect(aboutPage).toContain("alt={workshopPhoto.alt}");
    expect(aboutPage).toContain("{workshopPhoto.caption}");
  });
});
