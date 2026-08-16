# API conventions

## Shape

The browser calls same-origin JSON endpoints under `/api`. Endpoints express domain reads and commands rather than exposing database tables. Hono owns HTTP routing; domain services remain independent of Hono and D1 types.

## Validation

The Worker validates every untrusted request with Zod. Browser validation improves interaction but is never authoritative. Invalid fields use stable field paths suitable for React Hook Form.

## Errors

Errors use `application/problem+json` and the Problem Details structure. Responses include:

- `type`: stable problem category URI
- `title`: short category label
- `status`: HTTP status
- `detail`: safe user-facing explanation
- `code`: stable application error code
- `request_id`: diagnostic correlation identifier
- `errors`: optional field-path errors

Frontend behavior depends on `status` and `code`, never on translated message text. Internal exceptions, SQL, stack traces, request bodies, and private domain data never appear in responses.

## Correlation

Every response includes a request identifier. State-changing commands also carry a client-generated operation identifier so UI feedback, retries, Worker logs, and domain writes can be correlated.

## Client diagnostics

The browser may report sanitized React, global error, and unhandled rejection diagnostics to `/api/diagnostics/client-errors`. Reports contain technical location, application version, current route, and a scrubbed stack. They never contain component state, form values, request bodies, or domain data.
