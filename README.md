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

## Maintenance guides

Coding agents should read [`AGENTS.md`](AGENTS.md) before modifying the
repository. My practical local workflow is documented in `INTERNAL.md`, which
is deliberately excluded from Git.

## Modular content model

I keep the public data in `src/content/` so the portfolio can grow without
duplicating page markup:

| File              | Controls                                                           |
| ----------------- | ------------------------------------------------------------------ |
| `projects.json`   | Project identity, classification, card copy and detail content     |
| `skills.json`     | Skill groups and toolbox entries                                   |
| `timeline.json`   | The recurring technical threads connecting projects                |
| `navigation.json` | Header and footer navigation                                       |
| `socials.json`    | External public profile links, never this portfolio itself         |
| `contact.json`    | Contact-page wording and the configurable public email             |
| `site.json`       | Portfolio identity, canonical URL, metadata, theme and footer copy |

Adding a project means adding one validated object. Astro then creates its card,
route, metadata, related-project suggestions and fallback artwork. No matching
page file is required.

The numeric `year` is the start year. `yearEnd` is `null` for a single-year
project, a later number for a completed range, or `"Now"` for ongoing work.
Cards, detail pages and social previews format the corresponding label
automatically.

Each content file has one owner role. Profile URLs are read only from
`socials.json`, contact details only from `contact.json`, and the portfolio's
canonical address only from `site.json`. Validation rejects duplicate profile
IDs, duplicate navigation targets, legacy profile fields in `site.json` and any
attempt to add the portfolio itself as an external profile.

Fields inside each project are also deliberately separated: `summary` supplies
cards and metadata, `subtitle` labels the detail hero, categories drive
classification, technologies drive tool tags and search, and `content` owns the
actual project narrative. There is no second “highlights” list repeating facts
already stated by the detail content.

Project detail content is assembled from a safe set of typed blocks: paragraphs,
headings, images, galleries, code, quotes, callouts, specifications, timelines,
link groups, videos and diagrams. The JSON cannot inject arbitrary HTML.

## Project visibility and media

Each project can be `public`, `draft` or `hidden`. Draft and hidden projects do
not appear in production. Missing images never produce broken cards; the site
uses a text-free category illustration until I add a real image and accurate alt
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

## Deployment

Run `npm ci` followed by `npm run build`. The verified static output is written
to `dist/`, ready for Cloudflare Pages or another static host. The portfolio's
canonical address is configured as `www.ItzSunBoi.dev`.

## Licence

See [LICENSE](LICENSE).
