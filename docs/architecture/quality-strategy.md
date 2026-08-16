# Quality strategy

## Approach

Development follows test-driven development. Tests express domain behavior before implementation and stay focused on observable outcomes rather than internal structure.

Unit tests use table-driven testing through Vitest `it.each` or `test.each` whenever multiple cases share one behavior shape. A direct test remains preferable when parameterization would obscure intent or setup.

Mutation testing measures whether tests detect meaningful logic changes. It complements coverage; it does not replace readable examples or exploratory testing.

## Test layers

| Layer | Tooling | Scope |
|---|---|---|
| Domain unit tests | Vitest | Quantity arithmetic, conversion, recipe versioning, cooking, servings, expiry, and validation rules |
| API and service tests | Vitest with mocked persistence | Hono handlers, validation, orchestration, success, and failure responses |
| Component tests | Vitest and Testing Library | Complex form and interaction behavior |
| Browser workflow tests | Playwright with mocked API responses | A small set of critical user interactions without a database |
| Mutation tests | StrykerJS with the Vitest runner | Pure critical TypeScript domain and application logic |

## Mutation boundaries

Tests never connect to D1. Persistence behavior is represented by small repository interfaces and mocked at the application boundary. No local, ephemeral, staging, or test database is created.

Mutation scope includes arithmetic, rounding, within-type unit conversion, expiry state, recipe versioning, and cook/consume transition rules. It excludes generated files, schema declarations, migrations, route wiring, visual styling, GSAP animation, and trivial mappings.

## Execution policy

- Every change runs type checking and relevant unit, mocked service, component, and browser tests.
- Each completed critical domain block receives a local Stryker run during implementation.
- A full configured mutation run executes before R1 is considered complete.
- The configured Stryker mutation scope must achieve at least a 90% mutation score. `thresholds.break` is 90.
- A surviving mutant triggers review of the test or the production code; it does not automatically justify a low-value assertion.

Cloudflare Workers Builds runs ordinary checks and the application build on every push to `master`. Full mutation testing stays outside the deployment build to avoid unnecessary build time.
