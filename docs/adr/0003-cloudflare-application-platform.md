---
status: superseded by ADR-0007
---

# Use Cloudflare as the application platform

Historical decision. Runtime, persistence, access, and recovery portions are superseded by [ADR 0007](0007-versioned-catalog-local-activity.md); Cloudflare remains the static hosting provider.

Foodie Planner will run as one Cloudflare Worker with static assets, D1, and Access restricted to one email. This provides synchronized relational data, atomic batches, managed access, and an expected $0 MVP without another Supabase project. EU D1 placement addresses data location; free D1 Time Travel is the only operational recovery mechanism.

## Considered options

- Vercel with Neon: more portable PostgreSQL, but more providers and access setup.
- Firebase: easy start, but a poorer relational fit and higher lock-in.
- Mac or VPS hosting: more control, but unacceptable availability or maintenance burden.

## Consequences

Worker bindings and Access create medium Cloudflare lock-in. D1 remains exportable as SQL, free-tier limits are hard stops, and production must monitor usage. The user accepts that data loss discovered outside the seven-day free Time Travel window may be unrecoverable.
