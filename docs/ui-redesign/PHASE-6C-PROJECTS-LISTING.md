# Phase 6C: Projects Listing / Project Showcase

## Scope

Redesigned only `/projects` as a premium project showcase and portfolio inventory. The Work listing and Work detail pages were not modified, and Phase 6D was not started.

## UX Distinction

- Work = Case Studies: narrative, strategic context, and the thinking behind the work.
- Projects = Project Showcase: a scannable archive of what the studio has built, with visual, category, and technical metadata.

## UI Changes

- Added a more compact project archive hero with factual project count.
- Replaced the repetitive card grid with image-led or typographic project showcase surfaces.
- Added dynamic project indexes based on the existing ordered query result.
- Added a stronger featured treatment when the actual `is_featured` field is true. The current data contains no featured project, so no fabricated featured label is shown.
- Kept category, status, duration, client, creation date, technologies, and tags as compact scanning metadata.
- Preserved real project imagery where available and used an honest typographic fallback where absent.
- Preserved live project links and added restrained hover/focus treatments.
- Retained and visually aligned loading, error, and empty states.
- Made the archive stack cleanly on mobile and use a two-column inventory at larger widths.

## Preserved Contracts

- Existing `listPublishedProjects` query, server function, ordering, and project data remain unchanged.
- Existing project content and image selection behavior remain intact.
- Every project detail link continues to use `/projects/$projectId` with the real project ID.
- Backend, Supabase, database, migrations, API routes, authentication, and business logic were untouched.
- Shared header, footer, ChatWidget, and WhatsAppButton were untouched.

## Files Changed

- `src/routes/projects.index.tsx`
- `docs/ui-redesign/PHASE-6C-PROJECTS-LISTING.md`

## QA

- Focused ESLint: passed with `npx eslint 'src/routes/projects.index.tsx'`.
- Full lint: passed with `npm run lint`.
- Build: passed for client and SSR output with `npm run build`.
- Browser QA: passed on `/projects`; hero, factual `08 projects` count, project names, categories, technologies, tags, images/fallbacks, indexes, header/footer, and widgets rendered.
- Responsive QA: passed at 375px, 390px, 414px, 768px, 1024px, 1280px, and 1440px.
- Project-link verification: passed for the first three real project IDs; each detail route loaded with the matching project title.
- Console/page errors: none observed.
- Horizontal overflow: none observed at any requested viewport.
- Regression QA: `/`, `/services`, `/work`, and a real `/work/<slug>` route rendered successfully without page errors or overflow.

## Warnings

Vite reports the existing application large-chunk warning during build. Git scope commands were unavailable because the supplied workspace folder is not a Git repository; file edits were limited to the two Phase 6C files created or modified for this task.
