import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const illustration = readFileSync(
  new URL("../src/components/hero/HeroIllustration.astro", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);

describe("hero exploded-render contract", () => {
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
    expect(styles).toMatch(/\.exploded-labels-light\s*\{[^}]*opacity:\s*1;/s);
    expect(styles).toMatch(
      /:root\[data-theme="dark"\] \.exploded-labels-light\s*\{[^}]*opacity:\s*0;/s,
    );
    expect(styles).toMatch(
      /:root\[data-theme="dark"\] \.exploded-labels-dark\s*\{[^}]*opacity:\s*1;/s,
    );
  });

  it("removes the superseded build-loop diagram", () => {
    expect(illustration).not.toContain("SYSTEM / BUILD_LOOP");
    expect(illustration).not.toContain("<svg");
    expect(styles).not.toContain(".workflow-card");
    expect(styles).not.toContain(".visual-readout");
  });
});
