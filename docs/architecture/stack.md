# Application stack

## Shape

Foodie Planner is one TypeScript web application deployed as one Cloudflare Worker. The Worker serves the React SPA as static assets and handles same-origin `/api` requests. D1 stores relational data. Cloudflare Access protects the entire application.

```text
macOS or iPhone browser
        |
Cloudflare Access
        |
Cloudflare Worker
  |-- React static assets
  |-- JSON API
  `-- domain rules
        |
       D1
```

## Chosen stack

| Area | Choice |
|---|---|
| Language | TypeScript |
| Internal language | English for source, API, logs, and database identifiers |
| Frontend | React SPA |
| Build tool | Vite |
| Styling and components | Tailwind CSS with a user-supplied shadcn/ui preset |
| Iconography | Koboyo Icons for R1 |
| Motion | GSAP for subtle interface motion |
| Client routing | React Router, Declarative Mode |
| Remote server state | TanStack Query |
| Form state | React Hook Form |
| Runtime validation | Zod |
| Cloudflare integration | Cloudflare Vite plugin |
| Server runtime | Cloudflare Worker |
| HTTP routing | Hono |
| Database | Cloudflare D1 |
| Database access | Drizzle ORM with explicit D1 operations where required |
| Access control | Cloudflare Access with one allowed email and OTP |
| Deployment | One protected `workers.dev` application |
| Platform CLI | Wrangler |
| Package manager | npm with committed `package-lock.json` |
| CI and deployment | Cloudflare Workers Builds from GitHub `master` |
| Testing | Vitest, Testing Library, Playwright, and mocked persistence |
| Mutation testing | StrykerJS for pure critical domain logic |
| Observability | Cloudflare Workers Logs and traces, viewed in the dashboard |
| Recovery | D1 Time Travel only |
| Accessibility | WCAG 2.2 AA |
| Operating cost | Free tiers only |
| Installability | Installable PWA shell |
| Connectivity | Online-only MVP; no offline data behavior |
| Interface language | Spanish (`es-ES`) only; no internationalization layer |

## Repository layout

```text
src/
  client/              React application
    components/
    features/
    pages/
    api/
  server/              Worker entry and HTTP routing
  domain/              Framework-independent domain rules
  shared/              Cross-boundary types and validation
db/
  migrations/          Ordered D1 schema migrations
public/                Static source assets
vite.config.ts         React and Cloudflare build integration
wrangler.jsonc         Worker, assets, D1, and environment bindings
```

The repository remains one package unless implementation reveals a concrete need to split it.

## Runtime boundaries

- Node.js runs local development and build tools such as the package manager, Vite, Drizzle Kit, Vitest, StrykerJS, and Playwright.
- The browser runs the React client, TanStack Query, React Hook Form, Zod client validation, and GSAP.
- Cloudflare `workerd`, not Node.js, runs the deployed Worker, Hono routes, server validation, and domain services.
- D1 runs as a managed database reached through a Worker binding.

Packages may be distributed through npm without requiring the Node.js runtime in production. Optional Workers Node.js compatibility is not an application architecture dependency.

## Naming language

All source identifiers, domain entities, API fields, error codes, log event names, database tables, columns, indexes, constraints, and migrations use English. TypeScript uses conventional `PascalCase` types and `camelCase` values. D1 uses `snake_case` identifiers. Visible interface copy remains Spanish.

The UI concept `Ingrediente` maps to the `RecipeIngredient` domain entity and `recipe_ingredients` table. It references one `Food` and stores `amountPerServing` plus its measurement unit.

## Request flow

The browser sends semantic commands rather than reproducing domain rules. For example, `POST /api/cooking-events` identifies a recipe, serving count, and cooking time. The Worker loads the recipe, scales ingredients, applies inventory rules, and commits inventory movements, the cooking event, and prepared servings in one D1 batch.

Read endpoints return JSON views for recipes, inventory, shopping, servings, calendar, nutrition, and history. The frontend owns presentation state; D1-backed state is authoritative.

TanStack Query owns the browser-side cache of D1-backed API data. Queries load and cache read models; successful mutations invalidate every affected query key so inventory, servings, calendar, and history converge on server state. It does not contain domain rules or replace local presentation state.

React Hook Form owns non-trivial form drafts, field-level errors, and dynamic field collections such as recipe ingredients. Simple confirmation forms may use native HTML and React primitives. Form submission uses TanStack Query mutations; authoritative validation and domain rules remain in the Worker.

React Router uses Declarative Mode for URL matching, nested layouts, navigation, and route parameters. Data loading and mutations remain in TanStack Query rather than React Router loaders and actions.

Zod schemas validate untrusted values at form and API boundaries. Shared schemas may provide inferred TypeScript types, but the Worker always validates requests independently of browser validation.

Hono maps `/api` requests to Worker handlers and provides middleware and consistent responses. It remains an HTTP adapter: domain rules do not depend on Hono types.

Drizzle defines the relational schema, generates migrations, and handles ordinary typed queries. Domain commands may use explicit D1 prepared statements and `batch()` when direct control is clearer or required for atomic multi-statement writes.

Quantities use scaled integers with two decimal places rather than binary floating-point storage. Mass, volume, count, nutrition, conversion results, and serving scaling round automatically to at most two decimals. No higher-precision workflow or rounding warning is required.

The visual layer starts from the shadcn/ui preset supplied by the user. Tailwind CSS handles styling and GSAP handles restrained, purposeful motion for transitions, cards, expansion, confirmation, reordering, and state changes. Motion never delays or carries essential meaning, and it respects `prefers-reduced-motion`. The PWA is installable on supported devices but still requires connectivity for all application data.

R1 uses selected SVG assets from [Koboyo Icons](https://koboyo.com/icons) for interface and food imagery. The assets are free for personal and commercial use without attribution and may be modified or animated. The application bundles only selected icons, not the icon collection. Foods use a specific icon when available and a category fallback otherwise; the app has no complete Koboyo picker. Recipe image uploads remain a post-R1 candidate.

## Routing

- Static asset paths are served without invoking application API code.
- Client-side routes fall back to the SPA entry document.
- `/api/*` routes execute Worker handlers.
- Access protects static assets and API routes.
- Worker code validates the Access identity assertion rather than trusting browser input.

## Cloudflare configuration

`wrangler.jsonc` identifies the Worker entry point, static asset build, compatibility date, D1 binding, and environment-specific resource IDs. The application uses a `DB` binding rather than exposing database credentials to the browser. Local interactive development and production use the same production D1 database; there is no staging application database.

D1 is created with EU jurisdiction. Schema migrations live in the repository and are applied explicitly during deployment; they do not run merely because a file exists.

Production migrations are applied directly when needed. A Time Travel bookmark is recorded first. No staging, local database rehearsal, or additional migration control system is required.

## Local development

Vite provides the frontend development server and hot module replacement. The Cloudflare Vite plugin runs Worker code locally in the Workers runtime while using a remote binding to the single production D1 database. Local and deployed applications may modify the same data without separate labels or safeguards. Tests mock persistence and never connect to a database.

## PWA updates

The PWA downloads new application assets in the background and shows a small update notice. Activation requires an explicit user action and never discards a form with unsaved changes.

## Deployment and recovery

Cloudflare Workers Builds connects to the GitHub repository and deploys only pushes to `master`. Non-production branch builds and previews are disabled. The build runs normal type checking, linting, tests, and application build before `npx wrangler deploy`. Build variables and secrets live in Cloudflare rather than GitHub. A manual local Wrangler deploy remains an emergency fallback.

Wrangler builds and deploys the Worker and static assets as one unit. Initial production uses the generated `workers.dev` hostname behind Access; a custom domain is optional.

D1 Time Travel is the only recovery mechanism. The free tier provides a seven-day recovery window. The user accepts that corruption or deletion discovered outside that window may be unrecoverable. No data export feature is planned.

## Boundaries

- Browser code never accesses D1 directly.
- Cloudflare contains no hand-written recipe logic outside this repository.
- Dashboard configuration is limited to resources, Access policies, secrets, observability, and deployment settings.
- No offline reads, queued writes, synchronization conflicts, SSR, SEO optimization, public registration, or multi-user permissions are required for MVP.
