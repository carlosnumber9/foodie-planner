# Operations

## Local work

Use the Node version in `.nvmrc`, run `npm ci`, then `npm run dev`. No environment secrets, database resources, or bindings are required. Development does not install a service worker; use `npm run build` and `npm run preview` to inspect the production PWA and offline behavior.

Use browser developer tools for local failures and IndexedDB inspection. Errors stay in the browser; no application diagnostics or activity are submitted to a server. Storage failures show a Spanish error and never report a successful save.

## Build and publication

`npm run build` validates and bundles app and accepted catalog together into `dist`. `wrangler.jsonc` retains the application name and configures `assets.directory` as `./dist` with `single-page-application` fallback; it has no Worker entry script, D1 binding, or secrets.

Publication is separate from content acceptance. After the user requests publication, `npm run deploy` runs typecheck, lint, unit/component tests, build, and Wrangler deployment. Run browser and documentation checks when relevant before that command. `npx wrangler deploy --config wrangler.jsonc --dry-run --outdir /tmp/foodie-static` validates packaging without publishing.

Existing Cloudflare Workers Builds may continue publishing approved pushes to `master`; the intended build is `npm ci`, checks, and `npm run build`, followed by `npx wrangler deploy --config wrangler.jsonc`. Repository changes do not configure the external build service. No external resources are provisioned or deleted as part of this transition.

## Offline and updates

The first complete online load installs the service worker and precaches release assets, including catalog data bundled into JavaScript. Only a complete installed release is available offline. New versions wait for user activation. Save or discard drafts before updating; never clear IndexedDB as part of an app/cache update. Keep the production origin stable, because a new origin has different browser storage.

Reloading and clearing the HTTP cache are distinct from deleting site data. IndexedDB has no remote recovery copy. The user accepts local loss; manual export/import is a future feature in the [roadmap](../roadmap.md).

To roll back, deploy a reviewed earlier static build. Verify compatibility with the local database version before rolling back; do not erase local activity to make an old release run.
