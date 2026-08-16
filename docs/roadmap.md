# Roadmap

This is the accepted initial delivery order. Each phase should end with a usable, tested workflow rather than isolated screens.

## Phase 0: Definition

- Complete functional and technical discovery.
- Settle language, invariants, and edge cases.
- Complete API, schema, library, recovery, testing, and observability decisions for the accepted Cloudflare and React stack.
- Turn domain scenarios into acceptance criteria.

## Phase 1: Foundations

- Scaffold the React TypeScript SPA, Worker API, Vite integration, Wrangler configuration, D1, and Access.
- Establish the protected `workers.dev` deployment and local development identity path.
- Import and translate a curated set of a few hundred common ANSES Ciqual 2025 foods with attribution.
- Implement food, nutrition, immutable food measurement types, and units.
- Establish data model, migrations, validation, observability, and testing.

## Phase 2: Inventory and shopping

- Implement holdings, movements, corrections, optional batches, location, and expiry.
- Implement manual shopping and purchase confirmation into inventory.
- Validate within-type unit conversions.

## Phase 3: Recipes and cooking

- Implement recipe scaling, duplication, archival, and post-use immutability.
- Implement cooking, ingredient subtraction, and prepared serving production.
- Implement grouping, assignment, consumption, removal, and expiry warnings.

## Phase 4: Optional calendar

- Implement configurable meal slots and recipe scheduling.
- Link prepared servings explicitly.
- Warn about missing ingredients when scheduling and on the planned day without changing shopping.

## Phase 5: Tracking

- Implement informational nutrition goals and daily totals.
- Implement culinary and wellbeing assessments.
- Implement searchable cooking and consumption history.

## Phase 6: Hardening

- Review mobile and desktop accessibility, especially icon hover, tap, and screen-reader behavior.
- Verify the D1 Time Travel recovery runbook.
- Measure daily upkeep and simplify workflows exceeding five minutes.

## Post-R1 candidates

- Evaluate optional recipe image uploads and their free storage requirements.
- Evaluate aggregate statistics and charts after enough personal history exists.
