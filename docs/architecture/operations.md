# Operations

## Diagnostic model

Cloudflare Workers Logs and traces are the initial observability platform. Production diagnostics are read in the Cloudflare dashboard. Sentry is deferred until native telemetry proves insufficient, particularly for browser-only failures.

Diagnostic logs are not durable domain history. Inventory movements, cooking events, consumption, and other user-visible facts belong in D1. Logs explain how an operation executed and why it failed.

## Structured logging

Every server request receives an invocation log. Every state-changing command emits one structured completion event with success or failure. Unexpected failures include a separate error event and stack trace.

Stable diagnostic fields include:

- `event`
- `outcome`
- `request_id`
- `operation_id`
- `route`
- `duration_ms`
- `status`
- `error_code`
- `entity_type`
- opaque `entity_id`

The client creates an operation ID for each command and sends it to the Worker. This correlates UI feedback, API handling, D1 work, and retries. Expected validation and conflict outcomes use an informational or warning severity; unexpected exceptions use error severity.

React error boundaries and global browser error handlers send sanitized diagnostics to `/api/diagnostics/client-errors`. The Worker records them in Workers Logs so they remain visible in the Cloudflare dashboard without Sentry.

Logs never contain recipe names, ingredient names, nutrition or wellbeing values, notes, email addresses, authorization data, request bodies, response bodies, or complete application state. Sensitive values must not appear in URLs because invocation logs include request URLs.

Initial trace sampling is complete because the application has one user and low traffic. Sampling and retention are revisited if volume or cost changes.

R1 has no automatic application-error alerts. A visible application error provides a request identifier, which the user can inspect manually in the Cloudflare dashboard.

## Recovery

D1 Time Travel is always-on point-in-time recovery for the complete database. The free Workers tier retains seven days. A restore overwrites the live database at a selected timestamp or bookmark; it is not row-level undo or application history.

Time Travel is the only recovery mechanism. No R2, local, third-party, or product export is required. The free tier's seven-day recovery window is an accepted risk; corruption or deletion discovered later may be unrecoverable.

If a free-tier limit rejects an operation, the Worker fails without reporting success or applying a client-side optimistic result. The UI shows a clear error with its request identifier. The system never enables billing, changes provider, or queues an offline write automatically.

## Sentry boundary

Sentry groups errors, stack traces, releases, and related diagnostic context, and can alert on recurring failures. It does not replace logs, domain history, or backups.

Sentry is not part of the initial stack. If later added, it primarily covers browser failures that Worker telemetry cannot see. Session Replay remains disabled, default PII collection remains off, and all events are scrubbed before transmission.
