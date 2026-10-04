# Phase 7: Services page redesign

## A. Objective

Redesign the public /services page into a premium editorial experience while keeping the route contract, CMS data source, business logic, and shared layout system intact.

## B. Scope constraints

The following were preserved as hard requirements:

- do not change route structure or page path
- do not change project/service slug usage, loader behavior, or query keys
- do not alter CMS/Supabase data fetching or any server-side contract
- do not change shared components such as SiteHeader, SiteFooter, or design tokens defined in the global system
- do not modify pricing logic, service selection, or backend workflow logic
- keep the implementation route-local to /services only

## C. Existing implementation audit

The current /services route is driven by the server-side query `getServicesPage()` from `src/lib/cms.functions.ts`.

Data consumed on the page:

- `services[]`
  - `id`
  - `title`
  - `slug`
  - `tagline`
  - `description`
  - `icon`
  - `starting_price_usd`
- `faqs[]`
  - `id`
  - `question`
  - `answer`
  - `category`

Behavior observed from the current route:

- `route.loader` ensures the query data loads with TanStack Query
- `errorComponent` and `notFoundComponent` remain in place for empty/error fallback states
- page uses a suspense query to render the actual content
- the page maps over a service list and includes a dynamic icon selection based on service icon names
- pricing is displayed only when `starting_price_usd` is present
- FAQ rendering is conditional on `data.faqs.length > 0`
- final CTA links to the contact flow via the app route, not a hardcoded external URL

## D. Design treatment applied

The redesign keeps the same data flow and visual system while shifting the presentation into a more premium editorial format:

- stronger top-of-page hero narrative with a more explicit conversion focus
- multi-card capability grid rather than a single stacked list
- emphasized service highlight treatment for the flagship offering
- improved hierarchy around pricing and CTAs without modifying the actual pricing logic
- cleaner FAQ section framed as a studio “good to know” block
- final CTA anchored to `/contact` to remain aligned with the existing site architecture

## E. Component and layout decisions

The page uses the existing established design primitives already used across the redesign series:

- `surface-section`
- `grid-hero`
- `radial-wash-primary`
- `marker-accent`
- `container-site`
- `container-content`
- shared header/footer structure

No new global CSS or route-breaking component structure was introduced.

## F. QA checks

Commands run:

- npx eslint 'src/routes/services.tsx'
- npm run lint
- npm run build

Result:

- route-level lint initially surfaced a Prettier wrapping issue in the CTA text
- the issue was corrected and validation was re-run
- final lint and build completed successfully
- the project remains production buildable with no blocker introduced by the services redesign

## G. Notes

The redesign intentionally does not add or remove service data, does not alter the service query contract, and does not affect any other route or page. The work stays fully in the presentation layer for /services.
