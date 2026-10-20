# Quality strategy

Tests verify observable behavior and domain invariants. Prefer table-driven cases when they improve readability; avoid tests that only repeat implementation structure or documentation wording.

## Layers

- Vitest domain tests cover integer quantities, rounding, conversions, immutability, and nutrition.
- Catalog tests cover empty catalogs, provenance, references, compatible units, deterministic serialization, and append-only evolution.
- Repository tests use fake-indexeddb to exercise real IndexedDB semantics: reopen, atomic rollback, uniqueness, corruption, unavailable storage, and catalog replacement without resetting activity.
- Testing Library covers public routes, read-only catalog views, local saves, failure feedback, and update protection for unsaved drafts.
- Playwright serves a production build. Desktop Chromium and mobile WebKit cover navigation and local persistence; Chromium additionally covers service-worker offline reopening and release updates.
- Stryker measures pure critical domain/application behavior, with a configured minimum score of 90%. It runs locally after critical domain changes and before R1 completion, outside ordinary deployment builds.

## Execution

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` for implementation changes. Catalog validation runs during build and separately through `npm run catalog:check`. Run `npm run docs:check` after documentation changes and `npm run test:e2e` after browser, local persistence, or PWA changes.

Tests never connect to production or remote databases. Synthetic catalog examples belong only in tests; production food and recipe catalogs start empty. Browser fixtures use isolated profiles and temporary local databases. Future export/import must prove round-trip restoration after site-data deletion and no modification for invalid input.
