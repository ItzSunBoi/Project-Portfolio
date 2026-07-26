import { describe, expect, it } from "vitest";
import { content } from "../src/lib/content";
import { absoluteUrl, pageTitle } from "../src/lib/seo";
import { resolveThemePreference } from "../src/lib/theme";

describe("URL generation", () => {
  it("creates canonical absolute URLs", () => {
    expect(absoluteUrl("/projects/", content.site)).toBe(
      "https://itzsunboi.dev/projects/",
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
