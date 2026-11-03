import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { content } from "../src/lib/content";
import { formatProjectYear } from "../src/lib/dates";
import { responsiveSrcSet } from "../src/lib/responsive-images";
import { absoluteUrl, pageTitle } from "../src/lib/seo";
import { resolveThemePreference } from "../src/lib/theme";

const styles = readFileSync("src/styles/global.css", "utf8");

function luminance(hex: string) {
  const channels = hex.match(/[a-f\d]{2}/gi)!.map((value) => {
    const channel = parseInt(value, 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("theme text contrast", () => {
  for (const [theme, selector] of [
    ["light", ":root"],
    ["dark", ':root[data-theme="dark"]'],
  ]) {
    it(`${theme} text roles meet normal-text contrast on all page surfaces`, () => {
      const rule = styles.slice(styles.indexOf(`${selector} {`)).split("}")[0];
      const tokens = Object.fromEntries(
        [...rule.matchAll(/--([\w-]+):\s*(#[a-f\d]{6});/gi)].map(
          ([, name, value]) => [name, value],
        ),
      );
      for (const foreground of [
        "text",
        "text-secondary",
        "primary-strong",
        "success",
        "warning",
      ]) {
        for (const background of ["page-bg", "surface", "secondary-bg"]) {
          expect(
            contrast(tokens[foreground], tokens[background]),
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
      const buttonBackground =
        theme === "dark" ? tokens.primary : tokens["primary-strong"];
      const buttonText = theme === "dark" ? tokens["page-bg"] : "#ffffff";
      expect(contrast(buttonBackground, buttonText)).toBeGreaterThanOrEqual(
        4.5,
      );
    });
  }
});

describe("URL generation", () => {
  it("creates canonical absolute URLs", () => {
    expect(absoluteUrl("/projects/", content.site)).toBe(
      "https://www.itzsunboi.dev/projects/",
    );
  });

  it("adds the brand to page titles once", () => {
    expect(pageTitle("Projects", content.site)).toBe("Projects | ItzSunBoi");
    expect(pageTitle(content.site.title, content.site)).toBe(
      content.site.title,
    );
  });
});

describe("theme preference resolution", () => {
  it("prefers a saved theme over the system setting", () => {
    expect(resolveThemePreference("light", true)).toBe("light");
  });

  it("uses the system preference on a first visit", () => {
    expect(resolveThemePreference(null, true)).toBe("dark");
    expect(resolveThemePreference(null, false)).toBe("light");
  });

  it("supports an explicit configured fallback", () => {
    expect(resolveThemePreference(null, false, "dark")).toBe("dark");
  });
});

describe("project year formatting", () => {
  it("formats single years, completed ranges and ongoing work", () => {
    expect(formatProjectYear(2026, null)).toBe("2026");
    expect(formatProjectYear(2024, 2026)).toBe("2024–2026");
    expect(formatProjectYear(2025, "Now")).toBe("2025–Now");
  });
});

describe("responsive project images", () => {
  it("serves three widths for organised project photos", () => {
    expect(
      responsiveSrcSet("/gigaplex/images/lit-console-cover-1600.webp"),
    ).toBe(
      "/gigaplex/images/lit-console-cover-480.webp 480w, /gigaplex/images/lit-console-cover-960.webp 960w, /gigaplex/images/lit-console-cover-1600.webp 1600w",
    );
  });

  it("leaves unrelated images without invented variants", () => {
    expect(responsiveSrcSet("/social-preview/gigaplex.svg")).toBeUndefined();
    expect(
      responsiveSrcSet("https://example.com/photo-1600.webp"),
    ).toBeUndefined();
  });
});
