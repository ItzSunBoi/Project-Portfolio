import { describe, expect, it } from "vitest";
import { content } from "../src/lib/content";
import { formatProjectYear } from "../src/lib/dates";
import { responsiveSrcSet } from "../src/lib/responsive-images";
import { absoluteUrl, pageTitle } from "../src/lib/seo";
import { resolveThemePreference } from "../src/lib/theme";

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
