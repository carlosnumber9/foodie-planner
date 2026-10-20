---
status: accepted
---

# Use a versioned repository catalog and browser-local activity

Foodie Planner separates public, accepted food/recipe JSON in Git from personal activity in IndexedDB. A static React app bundles the catalog, runs domain rules locally, and works offline after an initial complete online load; Cloudflare only serves static assets. This removes remote database, API, authentication, and service configuration at the accepted cost of no synchronization and possible local data loss.

Catalog revisions are append-only and references pin exact versions, preserving quantities and nutrition in plans and history. Codex proposes content, the user accepts it, and publication remains a separate action. A future downloadable export/import feature will transfer or restore all personal activity; no automatic backup is introduced.

This supersedes ADR 0001's separate-recipe copy policy, ADR 0003's runtime/database/access/recovery architecture, ADR 0004's API/plugin/offline assumptions, and ADR 0006's authentication decision. React, TypeScript, Vite, static Cloudflare hosting, and fixed food measurement types remain accepted. No existing external resources are deleted by this decision.
