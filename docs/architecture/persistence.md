# Persistence

## Catalog ownership

Accepted content lives in `data/catalog/foods/<id>.json`, `data/catalog/recipes/<id>.json`, and `data/catalog/units.json`. [Catalog authoring](../catalog-authoring.md) owns file format and approval rules. The TypeScript schemas are authoritative for validation.

Food and recipe revisions are append-only; references contain a stable ID and exact revision. Ingredients pin food revisions as well as unit and per-serving amount. Recipe archival affects discovery only. Every earlier revision remains shipped so later catalog releases can resolve existing plans and history. Updating food nutrition does not silently recalculate an existing recipe revision.

The build validates structural rules, revision order, references, and compatible units. When available, Git HEAD and its parent are compared for destructive evolution. Shallow or absent Git history cannot prove historical immutability, so authoring review must also preserve all committed revisions.

Quantities and nutrition use safe integer hundredths. Base units are grams, millilitres, and count; compatible units convert through their fixed factor. Nutrition is per 100 g, 100 ml, or count unit. Recipe totals are calculated from the pinned ingredients rather than maintained manually.

## Browser activity

Native IndexedDB database `foodie-planner`, version 1, contains `settings`, `personalUnits`, and `unitPreferences`, keyed by `id`. Settings use the singleton ID `preferences` and store a validated IANA time zone. Personal unit IDs use the `personal-` prefix; code uniqueness is enforced in the write transaction. Catalog units are never edited locally: activation overrides are separate records.

Schema upgrades occur in `onupgradeneeded`. Existing stores must not be deleted or recreated to handle errors or catalog updates. Connections close on version changes. Corrupt data, unavailable storage, blocked upgrades, and failed writes are explicit failures; no empty-state or memory-only fallback claims to have saved data.

Future cooking, consumption, purchase, undo, and calendar assignment commands must commit all related writes in one IndexedDB transaction. Enqueue requests within the active transaction; do not await unrelated work that could auto-commit it. A failure aborts the entire command. Only transaction completion permits success feedback.

## Lifetime and recovery

Activity belongs to the current browser profile and origin. Local development and production are independent. Reloading or updating app assets preserves it; clearing site data, losing the device, or browser eviction can erase it. Requesting persistent storage reduces automatic eviction but does not back up data.

Manual export/import of every personal store is a future [roadmap feature](../roadmap.md). No backup or restore UI exists in the foundation.
