# PHASE 8 — WORK + PROJECTS

## Scope

Audited and aligned these portfolio routes:

- `/work`
- `/work/$slug`
- `/projects`
- `/projects/$projectId`

The review also covered the existing shared shell and design utilities used by these routes. No shared component changes were required.

## Design Objective

- **Work = Case Studies:** narrative-led presentation focused on context, challenge, thinking, build, technology, and case-study navigation.
- **Projects = Showcase:** image-led presentation focused on project identity, concise technical information, real metadata, image galleries, live links, and archive navigation.

The existing implementations already maintained this distinction, so the phase intentionally avoided a broad redesign.

## Changes Made

Only these presentation-layer corrections were required:

- Corrected the `/work` supporting-list counter so it reports the actual number of supporting case studies instead of a fixed `01 / total` label.
- Aligned `/projects/$projectId` CTA and showcase surfaces with the established restrained radius treatment by replacing inconsistent pill/oversized radius styles with the existing `rounded-lg` treatment.

No content, data, ordering, routing, or business behavior was changed.

## Preserved Functionality

- Existing Supabase/CMS queries and query keys remain unchanged.
- Existing loaders, suspense/query behavior, error handling, empty states, and not-found states remain intact.
- Work slug handling and project ID handling remain unchanged.
- Work previous/next navigation continues to use real portfolio data.
- Project ordering, featured-project behavior, live project URLs, and contact links remain unchanged.
- Project image selection, sorting, broken-image fallback, thumbnails, and accessible image labels remain intact.
- SiteHeader, SiteFooter, ChatWidget, WhatsApp behavior, authentication, pricing, and unrelated routes were not modified.
- No fake projects, images, dates, statistics, testimonials, or outcomes were introduced.

## Responsive QA

The existing responsive implementations were reviewed against the required widths:

- 375px
- 390px
- 414px
- 768px
- 1024px
- 1280px
- 1440px

The route-local changes do not introduce fixed-width elements or new overflow risks. A full browser viewport sweep was not executable in this session because browser automation tools were unavailable.

## Browser QA

The shared browser context showed `/projects` at `http://localhost:5174/projects`. Browser automation was unavailable, so the following could not be truthfully claimed as completed in this phase:

- screenshot-based viewport checks at all seven widths
- browser console inspection
- click-through testing of detail routes and widgets

The current local dataset has no published project records, so no real project ID was available for `/projects/$projectId`. No real Work slug was available for `/work/$slug` in the local data state either. Detail-route behavior was preserved by inspection, but not claimed as an end-to-end click test.

## Regression QA

The required regression route set was reviewed from the existing application structure:

- `/`
- `/services`
- `/pricing`
- `/contact`
- `/work`
- `/projects`

No unrelated route files were modified.

## Lint

Passed:

- `npx eslint "src/routes/work.index.tsx" "src/routes/work.$slug.tsx" "src/routes/projects.index.tsx" "src/routes/projects.$projectId.tsx"`
- `npm run lint`

## Build

Passed:

- `npm run build`

The build continues to emit the existing Vite large-chunk warning. It is project-wide and does not block the production build.

## Limitations

- Browser automation and screenshot verification were unavailable in the active toolset.
- The local published dataset contained no real project IDs or Work slugs for detail-route interaction testing.
- No new browser/runtime errors can be asserted beyond the executable lint/build checks and the existing shared browser state.
