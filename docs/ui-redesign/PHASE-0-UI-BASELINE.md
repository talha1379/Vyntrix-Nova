# Phase 0 UI Baseline

Status: inspection-only baseline. No application source, configuration, dependency, database, or generated files were modified.

## Project Shape

- Stack: React 19, TanStack Start/Router/React Query, Vite, Tailwind CSS v4, Supabase, Lucide icons.
- Routing: file-based routes under `src/routes`; generated route output is `src/routeTree.gen.ts`.
- Shared UI: `src/components/site`, `src/components/admin`, and reusable primitives under `src/components/ui`.
- Server boundary: public CMS/data server functions under `src/lib`; authenticated server functions use `requireSupabaseAuth`.
- Supabase client/auth wiring: `src/integrations/supabase`; browser auth is attached to server-function calls through `src/start.ts`.

## Global UI Baseline

- Colors: dark deep-navy background; lighter navy surface/card/popover layers; electric blue primary; cyan accent; pale foreground; muted blue-gray text; red destructive state. Semantic values are defined as OKLCH CSS variables in `src/styles.css`.
- Fonts: `Space Grotesk` for display/headings and `DM Sans` for body text, loaded from Google Fonts in `src/routes/__root.tsx`; system fallbacks are declared in the theme.
- Spacing: Tailwind utility spacing, typically centered `max-w-6xl` content with `px-5`, section padding around `py-20` to `py-24`, and compact control gaps of `gap-2` to `gap-5`.
- Border radius: base `--radius: 0.75rem`; semantic radii map through Tailwind from small to 4xl. Common controls use `rounded-lg`, tags use `rounded-full` or `rounded-md`, and panels use the `surface-panel` utility with the XL radius.
- Shadows: mostly restrained; elevated controls use `shadow-lg`, while highlighted panels use the `glow-ring` utility backed by a primary-color glow. `shadow-elevated` is defined but is not the dominant page treatment.
- Background/grid: dark solid semantic background; translucent surface bands; gradients are used for primary/text and panel surfaces; `grid-backdrop` uses a 64px square border grid on home-like hero sections and CTA panels; the home hero also uses `src/assets/hero-network.jpg` with an overlay.
- Buttons: inline-flex controls with blue `bg-primary` and light primary text, or bordered secondary controls; generally `rounded-lg`, compact text sizing, icon-plus-label patterns, hover opacity/color transitions, and disabled opacity.
- Cards/panels: `surface-panel` supplies surface color, subtle primary-tinted gradient, border, and rounded corners. It is used for services, work, testimonials, forms, estimates, jobs, projects, portal records, admin records, and chat.

## Global Components

- `SiteHeader`: sticky translucent header with logo, desktop nav for Services, Work, Projects, Pricing, About, Jobs, auth link, project CTA, and mobile menu.
- `SiteFooter`: four-column responsive footer with brand statement, company anchors/routes, contact details, Lahore/remote location, email, WhatsApp link, and copyright row.
- `ChatWidget`: fixed Nova assistant launcher and chat panel; streams responses from `/api/public/chat`, maintains local message state, and renders user/assistant bubbles.
- `WhatsAppButton`: fixed green circular launcher using the existing `WHATSAPP_URL` destination.
- `CurrencyToggle`: PKR/USD segmented control; `useCurrency` reads local storage, falls back to visitor country from the CMS server function, and persists changes.

## Public Pages

- Home (`/`): hero with image/availability badge/headline/CTA; services; featured work; four-step process; testimonials; FAQ details; contact CTA; footer.
- Services (`/services`): intro band; CMS-driven service grid with icons, taglines, descriptions, and starting prices; FAQ list; footer.
- Work (`/work/`): intro band; CMS-driven case-study card grid with category, duration, client, description, technologies, and detail links; footer.
- Work detail (`/work/$slug`): back link; project metadata and external links; overview/problem/solution sections; technology list; footer. Data comes from published CMS portfolio content.
- Projects (`/projects/`): careers-style grid hero; published project loading/error/empty states; image-backed project cards; footer.
- Project detail (`/projects/$projectId`): back link; primary image and thumbnail selector; publication/category metadata; live-project link; description/challenge/solution; technologies; footer.
- Pricing (`/pricing`): intro and currency toggle; selectable core deliverables; selectable add-ons; sticky live estimate with selected items; link to contact carrying selected IDs, total, and currency; footer.
- About (`/about`): intro band; values/how-we-work cards; CMS team member section; CMS testimonials section; footer.
- Contact (`/contact`): intro band; lead brief form; optional pricing estimate summary; scope guidance and pricing-calculator link; submitted confirmation with work and WhatsApp links; footer. Form inserts leads through Supabase.
- Jobs (`/jobs/`): careers hero and anchor CTA; open-position loading/error/empty states; published job list with department/location/type/experience; CV mailto action; footer.
- Job detail (`/jobs/$jobId`): job metadata and long-form details; skills; posted date; application form with resume validation/upload and Supabase insert; success state; footer.
- Auth (`/auth`): shared header; email/password sign-in form; session redirect to `/admin`; back-to-site link.

## Application Pages

- Client portal (`/_authenticated/portal`): authenticated route guard; portal header/sign-out; project list selector; selected project summary, status/progress, value and target date; milestones/timeline; shared files; invoices; project messages and send form. Uses `portal.functions.ts` and query invalidation for messages.
- Admin workspace (`/_authenticated/admin`): authenticated route guard; workspace header/sign-out; tabs for Overview, Leads, Client Projects, Projects, Jobs, and Content. Overview uses analytics; Leads lists/statuses and proposal generation; Client Projects manages portal projects; Projects manages published portfolio projects/images; Jobs manages jobs/applications; Content manages services, portfolio, testimonials, FAQs, team, and pricing items.
- Auth route guard (`src/routes/_authenticated/route.tsx`): checks `supabase.auth.getUser()` and redirects unauthenticated users to `/auth`.

## Protected Functionality Inspected

- Authentication: browser Supabase session, sign-in redirect, sign-out, authenticated route protection, bearer-token attachment, and server-side claims validation.
- Database/Supabase: generated browser/server clients, typed schema, public reads, authenticated queries/mutations, storage access, and existing migrations. No integration or migration files were changed.
- Business logic: CMS content loading/editing, portfolio and project data, job publishing and applications, lead submission/statuses, portal projects/messages/files/invoices, admin analytics, and AI proposal generation.
- Pricing/currency: CMS pricing items and USD-to-PKR rate, live selection totals, contact handoff query parameters, visitor-country fallback, and local-storage persistence.
- AI chat: `src/routes/api/public/chat.ts` and `ChatWidget` request/stream parsing were inspected and left untouched.
- WhatsApp: existing URL constant, footer link, contact link, and fixed launcher were inspected and left untouched.
- Routing: route paths, dynamic parameters, redirects, loaders, and generated route infrastructure were inspected and left untouched.

## Files Intentionally Protected

No changes were made to `src/lib/admin.functions.ts`, `src/lib/ai.functions.ts`, `src/lib/cms.functions.ts`, `src/lib/cms-admin.functions.ts`, `src/lib/jobs.functions.ts`, `src/lib/portal.functions.ts`, `src/lib/portfolio.functions.ts`, `src/integrations/supabase/*`, `supabase/migrations/*`, `src/server.ts`, `src/start.ts`, `src/routes/api/public/chat.ts`, route files, or generated route files.

## Validation and Git

- `npm run build`: passed before this report was added for both client and SSR builds.
- Build output includes a non-failing existing warning about a client chunk larger than 500 kB.
- Git: this directory is not a Git repository (`git status` returned `fatal: not a git repository`), so no checkpoint or commit was created.
- No application runtime behavior was changed in this phase.

## Phase 1 Readiness

READY FOR PHASE 1
