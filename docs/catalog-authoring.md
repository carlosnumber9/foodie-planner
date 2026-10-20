# Catalog authoring

This is the shared workflow for repository food and recipe skills. It does not authorize commits, pushes, deployments, or external service changes.

## Source of truth

Accepted files live under `data/catalog`: `foods/<id>.json`, `recipes/<id>.json`, and `units.json`. [Catalog schemas](../src/catalog/catalog.ts) define exact fields and validation. Identifiers use lowercase letters, digits, and hyphens and must match filenames. Object keys are alphabetically ordered with two-space indentation and a trailing newline. Unit records are ordered by ID. Preserve ingredient, step, and revision array order. Use `canonicalJson` from the schema module to serialize files deterministically.

A food document has `id` and `revisions`. Each revision contains `revision`, Spanish `name`, `measurementType`, `defaultUnitId`, `category`, nullable `iconKey`, `nutrition`, and `source` (`type`, `reference`, `version`, `attribution`). Nutrition contains energy in kcal and protein/carbohydrates/fat in grams, all as integer hundredths. Reference amounts are 100 g, 100 ml, or one count unit. Sources must be real Ciqual data or identified labels; missing values must be resolved, never invented. Do not infer mass/volume/count conversions from guesses.

A recipe document has `id`, `archived`, and `revisions`. Each revision contains Spanish `name`, `ingredients`, ordered `steps`, `tags`, nullable minute values `preparationTime`/`cookingTime`, and nullable `note`. Each ingredient pins `foodId`, `foodRevision`, `unitId`, and scaled integer `amountPerServing`. Recipes have no base serving count and do not store calculated nutrition. Empty ingredients/methods, incompatible units, and missing food revisions fail validation.

## Workflow

1. Read the existing relevant catalog entries and schemas. Find duplicates before proposing a new ID. Reuse compatible catalog units; personal browser units are not portable catalog references.
2. Prepare a human-readable proposal in chat, with ingredients per serving, steps, sources, and unresolved questions. Codex may propose recipes when requested; this is not an in-app recommendation feature.
3. Resolve missing source data, measurement type, and food references. A request to explore, list, draft, or propose is not acceptance. If the user already explicitly accepted the exact complete proposal, do not ask for redundant approval.
4. After acceptance, write only the accepted entries. Append revisions numbered consecutively from 1; never edit/remove earlier accepted revisions or change a food's measurement type. Retain every historical document and revision. Archive recipes through `archived`, not deletion. Do not silently rewrite dependent recipes when a food changes.
5. Run `npm run catalog:check` and relevant tests; build if bundling behavior changes. Review the diff and report accepted changes and validation. Stop before commit/push/publication unless separately requested.

Ciqual import selection and attribution require review before bulk import. The production catalog starts empty; [test examples](../tests/fixtures/catalog.ts) are synthetic and must never be promoted as real data.

## Behavioral checks for skills

- A complete accepted proposal writes only the agreed content and validates it.
- A rejected proposal or request to list content does not change catalog files.
- Missing nutrition/source data or unknown ingredient revisions lead to a focused clarification, not invented values or broken references.
- Editing a published recipe appends a revision; the old reference still resolves.
- No case implies a Git or deployment operation from content acceptance alone.
