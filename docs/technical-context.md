# Technical context

## Current state

The repository has no application, dependencies, configuration, or chosen stack. Technical choices must follow product requirements rather than inherited constraints.

## Known constraints

- One user, primarily on macOS and occasionally on iPhone.
- Responsive web app with synchronized data.
- Network connection required for all MVP reads and writes.
- Frequent, fast interactions.
- Deterministic, auditable quantities and conversions.
- Atomic updates across cooking, inventory, servings, and calendar to prevent double subtraction or partial state.
- Dates and meal slots respect one configurable user time zone.
- Recovery is limited to free D1 Time Travel; no export feature is planned.
- No remaining free Supabase project capacity is available to the user.

## Resolved technical direction

- The app is one TypeScript package deployed as one Cloudflare Worker.
- React and Vite build an online-only SPA served as Worker static assets.
- React Router Declarative Mode manages client-side navigation without owning data loading.
- TanStack Query manages remote server state, caching, mutations, and invalidation in the SPA.
- React Hook Form manages non-trivial form state and dynamic field collections.
- Zod validates form and API boundaries and provides inferred TypeScript types.
- Hono routes same-origin `/api` requests and provides HTTP middleware.
- The Worker owns framework-independent domain rules.
- D1 stores relational data and is available only through a Worker binding.
- Drizzle manages schema, migrations, and ordinary typed queries; explicit D1 operations remain available for atomic commands.
- Quantities use scaled integer storage with at most two decimal places and automatic rounding.
- Tailwind CSS and a user-supplied shadcn/ui preset form the visual foundation; GSAP provides subtle motion.
- The online-only app has an installable PWA shell without offline data synchronization.
- Development follows TDD with Vitest, mocked API and persistence tests, component tests, and mocked Playwright workflows.
- StrykerJS mutation testing targets pure critical domain logic through its Vitest runner.
- Cloudflare Workers Logs and traces provide initial production diagnostics with structured, privacy-safe events.
- Sentry is deferred until native tooling proves insufficient, especially for browser-only failures.
- Sanitized browser errors are forwarded to the Worker and read in the Cloudflare dashboard.
- Production logs are read only through the Cloudflare dashboard.
- D1 Time Travel is the only operational backup; the seven-day free-tier recovery limit is accepted.
- The entire deployed system must remain within free service tiers.
- The HTTP API uses Problem Details JSON with stable application codes, request correlation, and field errors.
- Accessibility targets WCAG 2.2 AA, including reduced motion.
- Local interactive development and production use the single production D1 database; there is no staging database.
- Automated tests mock persistence and never create or connect to a database.
- Production migrations are applied directly after recording a Time Travel bookmark.
- The interface is Spanish-only with `es-ES` formatting and no internationalization layer.
- Code, domain, API, diagnostic, migration, and database identifiers are always English.
- `RecipeIngredient` represents one food in one recipe and stores its amount per serving.
- PWA updates activate only after explicit confirmation and never discard unsaved form data.
- D1 uses explicit relational tables, scaled integer amounts, UTC timestamps, civil date strings, and IANA time-zone identifiers.
- Each state-changing domain command commits its related writes through one atomic D1 batch.
- Production migrations record a Time Travel bookmark first; recovery remains manual.
- Unit tests prefer table-driven `it.each` cases when they remain readable.
- StrykerJS enforces a 90% mutation score over its configured critical-domain scope.
- R1 has no automatic application-error alerts.
- npm manages the single package and commits `package-lock.json`.
- Cloudflare Workers Builds checks and deploys GitHub `master`; other branches do not build or create previews.
- Stryker runs locally after each critical domain block and once in full before R1, not in the deployment build.
- Free-tier failures stop the operation and surface a correlated error without paid or offline fallback.
- Cloudflare Access allows one email through OTP and protects the entire `workers.dev` application.
- Wrangler and the Cloudflare Vite plugin provide local runtime emulation, builds, and deployment.
- Measurement types are fixed to mass, volume, and count.
- Units are built-in or user-defined within one type through a base-unit factor.
- Every food owns one fixed measurement type; cross-type food equivalences do not exist.
- The initial nutrition catalog is a translated subset of a few hundred common ANSES Ciqual 2025 foods with attribution and manual version updates.
- Minor product nutrition differences use catalog estimates; meaningful differences use a duplicated personal food variant, never a per-holding override.
- Offline behavior is outside MVP scope.

## Discovery status

No blocking product or technical decisions remain for R1 scaffolding. Implementation may expose concrete edge cases, which must be added to the open-question frontier rather than silently assumed.

## Selection criteria

Prioritize zero operating cost, minimal maintenance, good macOS and iPhone support, data integrity, and easy evolution. Free-tier limits are hard constraints rather than triggers for paid upgrades.

See [application stack](architecture/stack.md) for the accepted architecture and [hosting research](research/hosting-options.md) for alternatives and official sources.
