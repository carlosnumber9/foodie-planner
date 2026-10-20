---
status: superseded by ADR-0007
---

# Use Worker-managed shared-password authentication

Foodie Planner authenticates its single user with one shared password verified by the Worker. A successful login creates a 30-day stateless `fp_session` cookie containing a version and expiry and signed with HMAC-SHA-256 through Web Crypto. Static assets and the SPA shell may remain public, but every data and diagnostics API outside the authentication endpoints requires a valid session.

There are no accounts, usernames, registration, password recovery, email, OTP, MFA, roles, or multi-user behavior. Cloudflare Access, Zero Trust, and external identity providers are not part of the system. `APP_PASSWORD` and a randomly generated `SESSION_SECRET` of at least 32 bytes are Worker secrets and operational responsibilities; rotating the session secret invalidates every session.

This simpler design accepts the lack of persistent rate limiting and enterprise access protection. A strong application password, safe secret handling, and deliberate rotation are required. This ADR supersedes only the authentication portions of earlier ADRs and research; the Cloudflare Worker, D1, deployment, and recovery decisions remain unchanged.
