import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RANDOM_DUCK_IMAGE_ENDPOINT } from "../src/lib/random-duck";

const errorPage = readFileSync(
  new URL("../src/pages/404.astro", import.meta.url),
  "utf8",
);
const duckLoader = readFileSync(
  new URL("../src/lib/random-duck.ts", import.meta.url),
  "utf8",
);
const footer = readFileSync(
  new URL("../src/components/layout/Footer.astro", import.meta.url),
  "utf8",
);

describe("404 duck", () => {
  it("uses the direct versioned JPG image endpoint", () => {
    expect(RANDOM_DUCK_IMAGE_ENDPOINT).toBe(
      "https://random-d.uk/api/v2/randomimg?type=jpg",
    );
  });

  it("loads the image without a cross-origin fetch request", () => {
    expect(duckLoader).not.toMatch(/\bfetch\s*\(/);
    expect(duckLoader).not.toContain("/api/v2/random?type=jpg");
    expect(duckLoader).toContain("image.src = RANDOM_DUCK_IMAGE_ENDPOINT");
  });

  it("keeps both lines in one error heading and preserves duck loading", () => {
    const heading = errorPage.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "";

    expect(errorPage.match(/<h1>/g)).toHaveLength(1);
    expect(heading).toMatch(
      />Error 404<.*\n\s*<span[^>]*>the page wandered off\.</,
    );
    expect(errorPage).toContain("Astro.response.status = 404");
    expect(errorPage).toContain("data-duck-image");
    expect(errorPage).toContain("initializeRandomDuck");
  });

  it("includes the full footer credit", () => {
    expect(footer).toContain("© 2026 Sun Zheng (ItzSunBoi)");
    expect(footer).toContain("Built with Astro plus a sprinkle of AI.");
    expect(footer).toContain("https://random-d.uk/");
  });
});
