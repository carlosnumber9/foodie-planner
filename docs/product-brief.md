# Product brief

## Purpose

Foodie Planner connects a personal recipe library, available food, shopping, cooking, prepared servings, consumption, and optional meal planning. The app calculates quantities and nutrition deterministically; it does not generate menus or decide what to eat.

## User and ownership

One person primarily uses a Mac. Catalog foods and recipes are public JSON maintained in this repository through Codex. Codex may propose recipes when asked; only accepted content enters the catalog. The app itself only reads that catalog.

Personal activity stays in the current browser's IndexedDB. There are no accounts, passwords, remote databases, data APIs, or synchronization between devices or browser profiles. Local data loss is accepted. A future manual export/import feature will support recovery and transfer.

## Principles

- The calendar is optional; cooking and consumption are separate facts.
- Inform and warn without deciding, blocking, or automatically changing shopping.
- Keep calculations explainable, with one fixed measurement type per food.
- Preserve original recipe and food revisions referenced by plans and history.
- Support offline reads and local writes after a complete first online load.
- Keep daily upkeep within five minutes and operating infrastructure minimal.
- Use a Spanish-only interface; code and documentation use English.

## Exclusions

Automatic menu planning, in-app AI recommendations, community contributions, household collaboration, remote activity storage, synchronization, automatic backups, and in-app catalog editing are outside the agreed scope. Importing web recipe content automatically is not an app capability; Codex can document a source supplied in chat.

The [roadmap](roadmap.md) distinguishes the delivered foundation from future workflows.
