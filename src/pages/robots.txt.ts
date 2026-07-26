import type { APIRoute } from "astro";
import { content } from "../lib/content";

export const GET: APIRoute = () =>
  new Response(
    [
      "User-agent: *",
      "Allow: /",
      `Sitemap: ${new URL("/sitemap-index.xml", content.site.baseUrl)}`,
      "",
    ].join("\n"),
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    },
  );
