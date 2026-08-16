# Hosting options

Research date: 2026-08-16. Requirements: one user, macOS-first, occasional iPhone use, online-only MVP, synchronized relational data, minimal cost and maintenance, and no available free Supabase project.

Decision outcome: accepted. See [ADR 0003](../adr/0003-cloudflare-application-platform.md).

## Recommendation

Use one Cloudflare Worker with static assets for the web app, D1 for relational data, and Cloudflare Access restricted to one email address. A protected `workers.dev` URL avoids buying a domain for the MVP and keeps expected cost at $0.

Create D1 with EU jurisdiction from the start. Keep photos outside D1. Use built-in Time Travel as the only operational recovery mechanism to preserve a zero-cost system; accept its seven-day free-tier window.

## Why it fits

- Workers Free includes 100,000 requests per day and static assets are free.
- D1 Free includes 5 million rows read and 100,000 rows written per day.
- D1 Free allows 10 databases, 500 MB per database, and 5 GB total storage.
- D1 batches support atomic domain actions such as subtracting ingredients and creating prepared servings.
- D1 Free includes seven days of point-in-time recovery and supports SQL export.
- Access supports an allowlist for one email and passwordless email OTP, avoiding an application user system.
- Access can protect the free `workers.dev` URL directly.
- D1 is SQLite-compatible and exportable, but Workers bindings and Access create medium provider lock-in.

Free limits are hard stops. If exceeded, reads or writes fail until reset or plan upgrade. This is unlikely for one user but must be observable.

## Alternatives

### Vercel plus Neon

Best alternative when PostgreSQL portability matters more than provider count. Neon Free currently offers many projects, 0.5 GB per project, scale-to-zero, and short point-in-time recovery; Vercel Hobby supports personal non-commercial use. Database lock-in is low, but hosting and authentication span more moving parts.

### Firebase

Firebase Spark is easy to start and includes hosting, authentication, and Firestore. It is not preferred because this domain is relational, Firestore increases denormalization, managed backup features require billing, and provider lock-in is high.

### Mac-hosted PocketBase through Tailscale

This avoids cloud database cost and keeps data local. It is not preferred because the Mac must remain awake and online, iPhone access depends on Tailscale, and patching, monitoring, and backups become personal responsibilities.

### Low-cost VPS

A VPS with SQLite or PocketBase improves availability and portability but introduces monthly cost and the highest maintenance burden. It offers little value for this MVP unless operating a server is itself a goal.

## Sources

- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare workers.dev routing and Access](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)
- [Cloudflare D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Cloudflare D1 data location](https://developers.cloudflare.com/d1/configuration/data-location/)
- [Cloudflare D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- [Cloudflare D1 import and export](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
- [Cloudflare Access OTP](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Neon pricing](https://neon.com/pricing)
- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)
- [Firestore pricing](https://firebase.google.com/docs/firestore/pricing)
- [Tailscale pricing](https://tailscale.com/pricing)
- [PocketBase production guidance](https://pocketbase.io/docs/going-to-production/)
