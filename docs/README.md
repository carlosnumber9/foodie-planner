# Foodie Planner documentation

Use the smallest relevant set of documents. Each concern has one authoritative home; other documents link to it rather than repeat its requirements.

## Product and domain

- [Product brief](product-brief.md): purpose, audience, and boundaries.
- [Functional specification](functional-spec.md): agreed behavior, including future capabilities.
- [Domain scenarios](domain-scenarios.md): acceptance examples.
- [Entity fields](entity-fields.md): domain records and version references.
- [Canonical glossary](../CONTEXT.md): domain language only.
- [Roadmap](roadmap.md): delivered foundation and pending delivery phases.
- [Open questions](open-questions.md): genuinely unresolved decisions.

## Implementation and authoring

- [Technical context](technical-context.md): implemented state and current limitations.
- [Application stack](architecture/stack.md): boundaries and build shape.
- [Persistence](architecture/persistence.md): catalog revisions, IndexedDB, and transactions.
- [Catalog authoring](catalog-authoring.md): shared workflow for the [food skill](skills/food-catalog/SKILL.md) and [recipe skill](skills/recipe-catalog/SKILL.md).
- [Visual system](architecture/visual-system.md): visual direction and accessibility.
- [Quality strategy](architecture/quality-strategy.md): relevant checks and test layers.
- [Operations](architecture/operations.md): local development, offline updates, and deployment.
- [Git workflow](git-workflow.md): commit conventions and authorization boundaries.

## Decision history

- [ADRs](adr/): decisions and explicit supersession; historical decisions do not override current architecture.
- [Hosting research](research/hosting-options.md): historical comparison, superseded by ADR 0007.
- [Nutrition research](research/nutrition-catalog-options.md): source research to revisit before importing data.

Update the authoritative document when behavior changes. Record implementation status in technical context and pending work in the roadmap. Keep resolved questions out of the open-question list. Avoid creating parallel instruction files or copying entire specifications into AGENTS.md or skills.
