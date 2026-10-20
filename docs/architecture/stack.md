# Application stack

## Shape

Foodie Planner is one static React SPA. The build imports repository JSON into versioned browser bundles; the service worker caches that same release. The browser runs domain rules and writes personal activity to IndexedDB. Cloudflare only serves public static assets with SPA navigation fallback.

| Concern | Choice |
|---|---|
| Language and package | TypeScript, one npm package, committed lockfile |
| Client and routing | React, Vite, React Router Declarative Mode |
| Validation | Zod at catalog and local persistence boundaries |
| Styling and motion | Tailwind, future user-supplied shadcn/ui preset, GSAP with reduced motion |
| Catalog | Repository JSON; shared revision-aware reader and build validation |
| Personal activity | Native IndexedDB transactions and versioned schema |
| Offline | Production service worker with manual activation |
| Hosting | Cloudflare Workers static assets, Wrangler, no main script |
| Testing | Vitest, Testing Library, fake-indexeddb, Playwright, Stryker |

## Boundaries

`src/domain` owns framework-independent arithmetic and measurement rules. `src/catalog` owns catalog schemas, revision resolution, and recipe nutrition. `src/client` owns presentation and local repositories. `data/catalog` contains accepted content; `scripts` contains deterministic checks.

There is no Worker application, authentication, HTTP data API, remote state cache, server ORM, or environment-secret configuration. React state holds drafts and loaded views, not the durable source of personal activity. IndexedDB commits must finish before success feedback.

Documentation and source identifiers use English; visible copy uses Spanish. The app remains installable, accessible, and free of automatic recommendations. The catalog and app deploy together; content never writes to production directly from the browser.

See [persistence](persistence.md) for data contracts and [operations](operations.md) for deployment and update behavior.
