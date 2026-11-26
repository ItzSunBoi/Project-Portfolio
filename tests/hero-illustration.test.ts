import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSweepHeight, profilerParts } from "../src/lib/profiler";

const illustration = readFileSync(
  new URL("../src/components/hero/HeroIllustration.astro", import.meta.url),
  "utf8",
);
const hero = readFileSync(
  new URL("../src/components/hero/Hero.astro", import.meta.url),
  "utf8",
);

describe("hero exploded-render contract", () => {
  it("signals internal project navigation with an internal arrow", () => {
    expect(hero).toMatch(
      /href="\/projects\/">\s*Explore projects\s*<span aria-hidden="true">→<\/span>/,
    );
  });

  it("presents one named hero heading for the active direction", () => {
    expect(hero.match(/<h1\b/g)).toHaveLength(1);
    expect(hero).toContain('<span class="sr-only">I build hardware.</span>');
    expect(hero).toContain('<span class="sr-only">{content.site.name}.</span>');
    expect(hero).not.toContain("Hardware, firmware & software");
  });

  it("shows the shared profiler beside the desktop hero and below the phone copy", () => {
    expect(hero.match(/<HeroIllustration\s*\/>/g)).toHaveLength(1);
    expect(hero).toMatch(/<div class="profiler">\s*<HeroIllustration/);
    expect(hero).toMatch(
      /\.home-hero\s*\{[^}]*grid-template-areas: "title profiler" "intro profiler";/,
    );
    expect(hero).toContain('grid-template-areas: "title" "intro" "profiler";');
  });

  it("layers the shared render beneath both theme-specific callouts", () => {
    expect(illustration).toContain("/images/hero/exploded-base.png");
    expect(illustration).toContain("/images/hero/exploded-text-black.png");
    expect(illustration).toContain("/images/hero/exploded-text-white.png");
    expect(illustration.indexOf("exploded-base.png")).toBeLessThan(
      illustration.indexOf("exploded-text-black.png"),
    );
    expect(illustration.indexOf("exploded-base.png")).toBeLessThan(
      illustration.indexOf("exploded-text-white.png"),
    );
  });

  it("uses black callouts in light mode and white callouts in dark mode", () => {
    expect(illustration).toMatch(
      /\.exploded-labels-light\s*\{[^}]*opacity:\s*1;/s,
    );
    expect(illustration).toMatch(
      /:global\(:root\[data-theme="dark"\]\) \.exploded-labels-light\s*\{[^}]*opacity:\s*0;/s,
    );
    expect(illustration).toMatch(
      /:global\(:root\[data-theme="dark"\]\) \.exploded-labels-dark\s*\{[^}]*opacity:\s*1;/s,
    );
  });

  it("keeps a live title and a square inspection bed", () => {
    expect(illustration).toMatch(
      /<figcaption[^>]*>\s*Dual Laser Surface Profiler\s*<\/figcaption>/,
    );
    expect(illustration).toMatch(/\.profiler-bed\s*\{[^}]*aspect-ratio:\s*1;/s);
  });

  it("removes the superseded build-loop diagram", () => {
    expect(illustration).not.toContain("SYSTEM / BUILD_LOOP");
    expect(illustration).not.toContain("<svg");
  });

  it("provides the mockup component controls with selectable callouts", () => {
    expect(profilerParts.map(({ label }) => label)).toEqual([
      "Assembly",
      "PCB",
      "Optics",
      "Case",
    ]);
    for (const part of profilerParts.slice(1)) {
      expect(illustration).toContain(
        `[data-part="${part.id}"] .exploded-labels`,
      );
    }
  });

  it("rounds the sweep position and keeps it within the visible bed", () => {
    expect(getSweepHeight(-1)).toBe(5);
    expect(getSweepHeight(52.65)).toBe(53);
    expect(getSweepHeight(120)).toBe(95);
    expect(
      profilerParts.every(({ height }) => getSweepHeight(height) === height),
    ).toBe(true);
  });
});
