# ItzSunBoi Project Portfolio

This is my public project portfolio for the hardware, firmware, PCB, robotics,
manufacturing and software systems I build. It is designed to make technical
work easy to explore without turning the site into a wall of logos, progress
bars or suspiciously perfect project histories.

## What the site does

- Presents featured work on a focused, responsive landing page
- Provides a searchable and filterable index for every public project
- Generates a dedicated detail route and social preview for each project
- Supports light, dark and system themes with a persistent local preference
- Uses informative, category-specific artwork when a real project image is not
  available
- Hides draft and private records from production
- Keeps contact deliberately static: no public form or server-side submission
  endpoint
- Validates structured content before a production build

## Technical specification

| Area           | Implementation                                          |
| -------------- | ------------------------------------------------------- |
| Framework      | Astro 7 with static output                              |
| Language       | TypeScript                                              |
| Styling        | Tailwind CSS 4 plus a shared responsive design system   |
| Content        | Strictly validated JSON                                 |
| Validation     | Zod, Astro checks, ESLint, Prettier and Vitest          |
| Hosting target | Cloudflare Pages or any static host                     |
| Client state   | Theme preference and project-filter URL parameters only |
| Backend        | None required                                           |

The generated site is fast, works without a database or CMS, and keeps
JavaScript limited to interactions that actually need it.

## Modular content model

I keep the public data in `src/content/` so the portfolio can grow without
duplicating page markup:

| File              | Controls                                                             |
| ----------------- | -------------------------------------------------------------------- |
| `projects.json`   | Project cards, detail pages, status, technologies and content blocks |
| `skills.json`     | Skill groups and toolbox entries                                     |
| `timeline.json`   | The recurring technical threads connecting projects                  |
| `navigation.json` | Header and footer navigation                                         |
| `socials.json`    | Configurable public profile links                                    |
| `site.json`       | Brand, metadata, theme, placeholder email and optional profile URLs  |

Adding a project means adding one validated object. Astro then creates its card,
route, metadata, related-project suggestions and fallback artwork. No matching
page file is required.

Project detail content is assembled from a safe set of typed blocks: paragraphs,
headings, images, galleries, code, quotes, callouts, specifications, timelines,
link groups, videos and diagrams. The JSON cannot inject arbitrary HTML.

## Project visibility and media

Each project can be `public`, `draft` or `hidden`. Draft and hidden projects do
not appear in production. Missing images never produce broken cards; the site
uses a coherent category illustration until I add a real image and accurate alt
text beneath:

```text
public/images/projects/<project-slug>/
```

## Privacy choices

This repository is intended to be public. It therefore contains no education
profile, location history, private contact form, webhook adapter or server-side
message endpoint. Public profile links remain configurable and blank links are
not rendered.

`INTERNAL.md` is reserved for my own notes and is intentionally excluded from
Git.

## Licence

See [LICENSE](LICENSE).
