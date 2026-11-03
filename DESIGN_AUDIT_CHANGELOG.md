# Design audit revision — 1.6.0

Prepared 3 November 2026 against the current local checkout and GitHub commit
`0c7e1fa03a46b7c9e6f1992e81ce71c60fcfaaf3`.

The working tree was clean before implementation. GitHub's latest commit
matched local HEAD. The user identified that source as the deployed version;
the serving production deployment identifier was not independently verified.
The September archive was not used to replace current source or content.

## Changes and preservation register

| Audit | Result                                                                                                                                         | Preserved information and location                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01   | Darker light-theme link/label blue and status colours; regression checks for normal-text contrast in both themes                               | Blue/yellow identity, existing theme controls and system preference support                                                                             |
| F02   | One project fills a wide image/text feature; two and larger collections use balanced grids; filtered result counts update the layout           | Project identity, summary, year, status, category, four tool tags and destinations remain on Home and Projects                                          |
| F03   | The complete exploration section renders only when entries reference public projects; validation errors still fail explicitly                  | Timeline JSON remains intact; populated and private-reference cases have regression coverage                                                            |
| F04   | Content-sized hero, smaller repeated headings, tighter section spacing and a plain closing navigation band                                     | Full capability statement, exploded figure, humour and every destination remain on Home                                                                 |
| F05   | Four discipline rows with semantic skill lists                                                                                                 | All group titles, descriptions, codes and 40 individual strings remain at `/#skills`                                                                    |
| F06   | Shared control/panel radius tokens, fewer shadows and framed surfaces; neutral case-study background                                           | Rounded, shadowed, square hero figure and its three aligned layers remain unchanged                                                                     |
| F07   | Clearer H1/H2 hierarchy, larger supporting text, properly named Home sections and appropriate project-index heading levels                     | Existing public wording retained                                                                                                                        |
| F08   | Quieter filter fieldsets, visible GET submit button, count-aware results and browser history restoration                                       | Existing `q`, repeated `category` and repeated `status` matching, counts, reset and direct query links remain                                           |
| F09   | Shared 672 px reading measure with 18 px narrative text; photos/tables can extend to 1040 px; diary title subordinate to its preceding heading | All 21 ordered project blocks, diary entries, specifications, captions, alt text and YouTube destination remain; JSON unchanged                         |
| F10   | About principles become a compact ordered list; contact copy/email move into the introductory header; profiles become simple labelled links    | All About descriptions and the shared “Practical curiosity, tested physically.” heading retained; exact contact copy, mailto and profile hrefs retained |
| F11   | Correct internal hero arrow, consistent CTA arrows, accessible project-image destinations and preserved focus styling                          | Navigation labels and destinations unchanged; footer authorship and duck attribution retained                                                           |

All seven files in `src/content/` and all 23 public assets were compared by
SHA-256 before and after implementation and remain byte-identical. Generated
HTML was also checked for all project narrative/specification/diary text,
image descriptions, skill strings and public contact/profile destinations.

## Verification

The required release sequence is `npm run check`, `npm run lint`, `npm test`
and `npm run build`. The build runs the existing artifact/privacy validator.
Dependencies were installed with `npm ci`; no dependency versions changed.

Browser review covered light and dark themes, desktop/tablet/mobile layouts,
320 and 375 px widths, both sides of 720 and 960 px, and all primary routes.
Reviewed navigation open/close, Escape, link selection, scroll lock, desktop
reset and Skills/Home current state. Exercised category/query/status
combinations, zero matches, reset and Back/Forward. Checked the contact email
in the initial mobile view and the case-study reading/media layout.

System-theme resolution and reduced-motion rules retain their existing
implementation and regression coverage. OS preference changes, explicit
200% text enlargement, 400% browser zoom, field performance metrics and
production recovery were not exercised. Browser layout review is not a claim
of full WCAG conformance.

## Boundaries reconciled with the report

This source is a static Astro site backed by validated JSON. It has no D1/R2
content service, admin publishing system, revisions, download block or E2E
publishing suite. Those report assumptions were not introduced into this
revision. No schema migrations, backend services or hosting changes were made.

The starting source has no pagination or `page` behavior. It also has no
server-side query evaluation without JavaScript. The GET form keeps query
choices in the URL; without JavaScript, all public project links and content
remain available, with an explicit explanation. This revision does not claim
capabilities absent from the baseline.

No production data, external messages, repository pushes or deployments were
performed. The release ZIP is source-only and excludes Git metadata,
dependencies, build output, caches, local/private data and secrets.
