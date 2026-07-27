import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const header = readFileSync(
  new URL("../src/components/layout/Header.astro", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);

describe("mobile menu rendering contract", () => {
  it("anchors the open panel below the header with a visible viewport height", () => {
    const panelRule = styles.match(/\.mobile-nav-panel\s*\{([^}]+)\}/)?.[1];

    expect(panelRule).toContain("position: absolute");
    expect(panelRule).toContain("inset-block-start: 100%");
    expect(panelRule).toContain("height: calc(100dvh - 76px)");
  });

  it("uses CSS-positioned bars for a centred, browser-stable close icon", () => {
    expect(header).toContain('<span class="menu-icon" aria-hidden="true">');
    expect(header).not.toContain('<path class="menu-line');
    expect(styles).toContain("transform: translateY(7px) rotate(45deg)");
    expect(styles).toContain("transform: translateY(-7px) rotate(-45deg)");
  });
});
