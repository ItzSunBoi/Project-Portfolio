import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.itzsunboi.dev",
  output: "static",
  devToolbar: { enabled: false },
  integrations: [
    sitemap(),
    {
      name: "portfolio-local-review",
      hooks: {
        "astro:config:setup": ({ command, injectRoute }) => {
          if (command === "dev") {
            injectRoute({
              pattern: "/review/",
              entrypoint: "./src/preview/Review.astro",
            });
          }
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["terminal.local"],
    },
  },
});
