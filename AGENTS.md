---
name: itzsunboi-portfolio-maintainer
description: Maintain the ItzSunBoi Astro portfolio while preserving its content ownership, privacy, voice, responsive behaviour and verified static release workflow.
---

# ItzSunBoi Portfolio Maintainer

## Scope

These instructions apply to the entire repository.

Use them when editing content, components, styles, interactions, tests, build
configuration or release artifacts for this portfolio.

## Objective

Maintain a public, static Astro portfolio for Sun Zheng (ItzSunBoi) that presents
hardware, embedded, PCB, robotics, manufacturing and software projects clearly.
Keep the implementation modular, restrained, responsive, accessible and easy to
extend through validated JSON.

The site is intended for `https://www.itzsunboi.dev`.

## Instruction priority

1. Follow the user's current request.
2. Preserve the privacy and publishing constraints in this file.
3. Preserve content ownership and validation invariants.
4. Make the smallest coherent change.
5. Follow existing design and code conventions.

If a requested change conflicts with a repository invariant, explain the
conflict and ask only when the user's intent cannot be satisfied safely.

## Required operating behaviour

- Inspect the current files before proposing or implementing a change.
- Treat the latest working tree as authoritative; do not reconstruct an older
  revision from memory.
- Preserve unrelated user changes.
- Prefer content edits over component edits when the requested value already
  has a JSON owner.
- Prefer shared components and design tokens over one-off markup or CSS.
- Add or update regression tests for bug fixes and behavioural changes.
- Validate the complete repository after editing.
- Do not publish or deploy the site unless the user explicitly asks in the
  current request.
- Never publish this project to ChatGPT Sites.
- Default handoff: a new versioned project ZIP plus a SHA-256 checksum.

## Repository architecture

| Path                           | Responsibility                                 |
| ------------------------------ | ---------------------------------------------- |
| `src/content/projects.json`    | Project cards, metadata and detail narratives  |
| `src/content/skills.json`      | Home-page skill groups                         |
| `src/content/timeline.json`    | Recurring exploration threads                  |
| `src/content/navigation.json`  | Global internal navigation                     |
| `src/content/socials.json`     | External public profiles only                  |
| `src/content/contact.json`     | Contact copy and public email                  |
| `src/content/site.json`        | Portfolio identity, canonical URL and metadata |
| `src/schemas/`                 | Allowed JSON shape and constraints             |
| `src/lib/content.ts`           | Cross-file validation and visibility           |
| `src/lib/project-taxonomy.ts`  | Category and status vocabulary                 |
| `src/components/`              | Reusable Astro presentation                    |
| `src/pages/`                   | Route composition                              |
| `src/styles/global.css`        | Shared tokens and responsive visual system     |
| `src/lib/` and `src/scripts/`  | Interaction logic                              |
| `public/`                      | Static media                                   |
| `tests/`                       | Regression tests                               |
| `scripts/build-verified.sh`    | Static production build                        |
| `scripts/validate-artifact.sh` | Artifact and privacy-route checks              |

## Public-content invariants

### Voice

- Write public prose from Sun's first-person perspective.
- Use direct, technically literate language.
- Keep humour subtle, dry and attached to a real engineering constraint.
- Do not invent achievements, metrics, project outcomes, links or completion
  states.
- Mark unfinished work honestly.

### Privacy

Do not add:

- education history or a credentials page;
- location history or semi-private identifying details;
- a public contact form;
- a contact API, webhook or server-side submission route;
- private email addresses, tokens or credentials.

The verified build must not contain:

```text
dist/credentials/index.html
dist/api/contact
```

The contact page remains static. External profile links remain configurable and
may be hidden until real URLs exist.

### Canonical identity

- `src/content/site.json` exclusively owns the portfolio's canonical URL.
- `src/content/socials.json` contains external profiles only.
- Never describe another “personal website”; this portfolio is
  `www.itzsunboi.dev`.
- If the origin changes, keep `site.json.baseUrl` and `astro.config.mjs.site`
  synchronized.

## Content exclusivity

Each fact should have one owner and one purpose.

### Per-project fields

| Field          | Required role                                          |
| -------------- | ------------------------------------------------------ |
| `title`        | Project name                                           |
| `subtitle`     | Detail-hero label                                      |
| `summary`      | Card copy, search and metadata                         |
| categories     | Classification, filtering and related-project matching |
| `technologies` | Search and index-card tool tags                        |
| `content`      | Narrative, decisions, specifications and current state |

Do not:

- repeat `summary` as the first content paragraph;
- reintroduce a Highlights field or sidebar;
- show category counts such as “4 disciplines”;
- repeat technology tags beside equivalent specifications on detail pages;
- repeat adjacent titles or categories inside fallback artwork;
- render empty link panels;
- duplicate Skills on About;
- turn exploration threads into another project index.

Page roles:

- Home introduces the portfolio and exposes selected work.
- About explains working style.
- Projects indexes work.
- Project detail pages document decisions and technical state.
- Contact provides static contact information and configured profiles.

## Project data constraints

Before editing `projects.json`, inspect `src/schemas/project.ts` and
`src/lib/project-taxonomy.ts`.

Current categories:

```text
hardware
firmware
software
pcb
robotics
computer-vision
manufacturing
web
embedded
```

Current statuses:

```text
completed
active
experimental
```

Visibility:

- `public`: generated normally.
- `draft`: generated only in development when
  `PUBLIC_SHOW_DRAFTS=true`.
- `hidden`: omitted by the standard visibility helpers.

Rules:

- `id` and `slug` are unique lowercase kebab-case strings.
- `year` is the numeric start year; `yearEnd` is `null`, a later numeric year
  or `"Now"`.
- A primary category may not be repeated in `secondaryCategories`.
- A featured project may not be hidden.
- A thumbnail requires meaningful alt text.
- Alt text must be `null` when the thumbnail is `null`.
- Unknown fields are rejected.
- Standard links are `github`, `demo` and `documentation`; absent links are
  `null`.
- Timeline references use project IDs, not slugs.
- Narrative copy must not duplicate other project narrative copy.

## Content-block changes

Supported project blocks are defined by the discriminated union in
`src/schemas/project.ts` and rendered by
`src/components/projects/ContentBlocks.astro`.

Current types:

```text
paragraph
heading
image
gallery
code
quote
callout
specificationTable
timeline
linkGroup
video
diagram
```

When adding or changing a block:

1. Update the schema.
2. Update the inferred TypeScript types through the schema.
3. Update `ContentBlocks.astro`.
4. Add styling through existing tokens.
5. Add valid and invalid test cases.
6. Confirm output remains accessible and responsive.

Do not allow arbitrary HTML through JSON.

## Visual-system invariants

- Use the custom properties defined at the top of `src/styles/global.css`.
- Support light, dark and system themes.
- Reuse `SectionHeading.astro` for equivalent heading hierarchy.
- Keep “Practical curiosity, tested physically.” inside the shared
  `SectionHeading` component.
- Use `→` for internal navigation and `↗` for external links.
- Avoid fake system readouts, decorative metrics and proficiency percentages.
- Ensure icons or artwork add information rather than repeat adjacent text.
- Respect `prefers-reduced-motion`.
- Preserve keyboard focus and semantic HTML.

Responsive checks must cover:

- above and below `960px`;
- above and below `720px`;
- a narrow mobile width near `375px`;
- both light and dark themes.

## Hero illustration invariants

The exploded render is three pixel-aligned `2048 × 2048` PNG layers:

```text
public/images/hero/exploded-base.png
public/images/hero/exploded-text-black.png
public/images/hero/exploded-text-white.png
```

- The base is shared by both themes.
- Black labels render in light mode.
- White labels render in dark mode.
- “Dual Laser Surface Profiler” remains live HTML in
  `HeroIllustration.astro`.
- Preserve the rounded card, shadow, responsive square layout and accessible
  description.
- Do not bake the live title into an image.

## Interaction invariants

### Mobile and tablet navigation

At widths below `960px`:

- the toggle is visible and operable;
- the panel fills the viewport below the sticky header;
- the hamburger forms a centred X;
- body scroll locks only while open;
- Escape closes the panel;
- selecting a link closes the panel;
- resizing to desktop resets the mobile state;
- ARIA state matches the visual state.

### Skills navigation state

`/#skills` is a Home-page section target, not a separate route.

- Selecting Skills makes Skills current.
- Home is not current while Skills is the active viewport section.
- Leaving Skills restores Home.
- Desktop and mobile links share one active state.

### 404 duck

The 404 page uses the direct image endpoint from `random-d.uk`.

- Do not call the JSON endpoint from browser `fetch()`; it fails cross-origin.
- Keep service failure non-blocking.
- Preserve normal 404 navigation when the image fails.
- Retain the footer attribution.

## Implementation rules

- Use Astro and TypeScript already present in the repository.
- Keep client-side JavaScript limited to real interactions.
- Prefer framework-independent functions in `src/lib/` for testability.
- Keep components focused and reuse existing primitives.
- Use semantic HTML and maintain accessible names.
- Do not add a backend for a static requirement.
- Do not introduce a CMS or database for JSON-owned content.
- Do not change dependencies during an unrelated content or styling task.
- When dependencies intentionally change, update and commit
  `package-lock.json`.
- Keep comments short and useful; do not narrate obvious code.
- Preserve null and empty-string conventions established by the schemas.

## Change workflow

### 1. Inspect

Read:

- the files named by the request;
- their callers or consumers;
- the relevant schema;
- existing tests;
- applicable styles and breakpoints.

Use search to locate every rendering of a changed field before editing it.

### 2. Classify

Choose the narrowest change class:

- Content-only: edit the owning JSON.
- Taxonomy: update taxonomy, labels, validation and filters.
- Content shape: update schema, rendering, tests and data.
- Layout/style: update shared component or global design system.
- Interaction: update the controller and behaviour tests.
- Build/release: update scripts or configuration without changing public content
  unnecessarily.

### 3. Implement

- Make a minimal coherent patch.
- Fix the source of truth, not generated `dist/` output.
- Preserve unrelated changes.
- Avoid duplicate compatibility code unless a supported browser requires it.
- If fixing a regression, encode the expected behaviour in a test.

### 4. Validate

Install with:

```bash
npm ci
```

Run, in order:

```bash
npm run check
npm run lint
npm test
npm run build
```

`npm run build` must execute artifact validation successfully.

For content-only changes, inspect the affected page. For visual or interaction
changes, inspect desktop, tablet and mobile layouts in both themes and exercise
the changed interaction.

Do not claim a check passed unless it was run successfully in the current
working tree.

### 5. Release

When the user requests a downloadable revision:

1. Choose a new version.
2. Update `package.json`.
3. Update both root-project version values near the top of
   `package-lock.json`.
4. Re-run validation.
5. Create a ZIP that excludes `.git`, `node_modules`, `dist`, `.astro`,
   coverage, caches and secrets.
6. Verify ZIP integrity.
7. Compute SHA-256.
8. Return the archive and checksum.

Do not overwrite a previously delivered archive name.

## Test map

| Area                          | Existing regression coverage          |
| ----------------------------- | ------------------------------------- |
| Content and privacy ownership | `tests/content-validation.test.ts`    |
| Project copy redundancy       | `tests/project-redundancy.test.ts`    |
| Project filtering             | `tests/filters.test.ts`               |
| Mobile menu state             | `tests/mobile-menu.test.ts`           |
| Mobile menu rendered geometry | `tests/mobile-menu-rendering.test.ts` |
| Skills/Home active navigation | `tests/navigation-state.test.ts`      |
| About heading hierarchy       | `tests/about-heading.test.ts`         |
| Hero layers and title         | `tests/hero-illustration.test.ts`     |
| CORS-safe 404 duck            | `tests/duck-404.test.ts`              |
| Shared utilities              | `tests/utilities.test.ts`             |

Extend the closest existing test before creating a disconnected test file.

## Completion criteria

A task is complete only when:

- the requested outcome is present;
- content ownership remains exclusive;
- public voice and privacy rules remain intact;
- no adjacent copy or visual repeats the same information unnecessarily;
- affected responsive and theme states work;
- relevant regressions are tested;
- checks, lint, tests and verified build pass;
- no deployment occurred without explicit authorization;
- the final handoff states what changed and what was verified;
- a requested archive has a unique filename and SHA-256 checksum.
