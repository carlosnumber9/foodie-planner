# Technical context

## Implemented

- React/TypeScript static SPA built with Vite, Tailwind, React Router, and restrained GSAP motion.
- Public read-only food and recipe views, search, Spanish copy, desktop sidebar, and mobile bottom navigation. Foods live under More.
- Empty production food and recipe catalogs, five common units, shared Zod validation, pinned food/recipe revisions, and recipe nutrition calculations.
- Catalog validation at development/build startup and through `npm run catalog:check`; committed revision evolution is checked when Git history is available.
- IndexedDB version 1 with settings, personal units, and unit activation overrides. Settings can be saved and units created or hidden through the UI.
- Native IndexedDB transactions, explicit failures, validated reads, and schema upgrade entry point. No memory-only success fallback or startup reset.
- Production PWA precaches the complete app including the bundled catalog. Updates require confirmation and wait for drafts to be saved or discarded.
- Static Cloudflare assets configuration and local production preview. No server runtime, data API, authentication, secrets, D1, or remote diagnostic submission.
- Repository-scoped content skills, shared authoring workflow, unit/component tests, and production browser tests.

## Not implemented

Calendar scheduling, inventory, shopping, cooking, prepared servings, consumption, assessments, and history are still placeholders or pending workflows. Their agreed behavior is specified but must not be described as delivered. Catalog Ciqual import and final visual assets remain pending. Export/import is planned and unavailable today.

## Operational boundaries

Activity is isolated by browser/profile/origin; development does not share production data. Closing the browser preserves IndexedDB, but site-data deletion can remove it. No remote copy exists. Storage persistence is requested opportunistically, never treated as a backup.

All domain quantities and nutrition use integers scaled by 100. Calendar dates remain civil dates; event instants remain absolute. Browser transactions will own each future multi-record domain command.

Local build and dry-run validation do not establish that production has been deployed. Deployment service settings and existing external resources are not changed by repository refactoring.

See [stack](architecture/stack.md), [persistence](architecture/persistence.md), and [roadmap](roadmap.md) for their respective sources of truth.
