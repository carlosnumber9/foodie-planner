# Foodie Planner documentation

This library records product and domain decisions as the idea evolves. Agreed behavior is documented; unresolved points remain explicit so assumptions do not become requirements.

## Product

- [Product brief](product-brief.md): problem, principles, user, and boundaries.
- [Functional specification](functional-spec.md): agreed behavior by area.
- [Domain scenarios](domain-scenarios.md): examples testing relationships and edge cases.
- [Entity fields](entity-fields.md): agreed domain records and their user-facing data.
- [Roadmap](roadmap.md): provisional discovery and delivery order.
- [Open questions](open-questions.md): current interview frontier.

## Domain and architecture

- [Canonical glossary](../CONTEXT.md): domain language without implementation details.
- [Application stack](architecture/stack.md): chosen runtime, frontend, backend, data, access, and deployment shape.
- [Visual system](architecture/visual-system.md): shadcn/ui preset, Koboyo assets, motion, and accessibility rules.
- [API conventions](architecture/api-conventions.md): HTTP success, validation, error, and correlation rules.
- [Persistence](architecture/persistence.md): D1 representation, atomic commands, and migration recovery.
- [Quality strategy](architecture/quality-strategy.md): TDD, test layers, and mutation testing scope.
- [Operations](architecture/operations.md): structured logs, traces, recovery, and external error monitoring.
- [Foundation operations](architecture/foundation-operations.md): local identity, remote D1 binding, and explicit migration safeguards.
- [Technical context](technical-context.md): repository state and pending technical decisions.
- [Hosting research](research/hosting-options.md): current deployment options and recommendation.
- [Nutrition catalog research](research/nutrition-catalog-options.md): free data sources, licenses, and recommendation.
- [ADRs](adr/): hard-to-reverse decisions whose rationale must be preserved.

## Maintenance

Each refinement round updates affected documents and removes resolved questions. Create an ADR only for a hard-to-reverse, surprising decision involving a real trade-off.
