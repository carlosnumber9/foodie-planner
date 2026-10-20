# Foodie Planner

Personal static web app connecting a curated recipe catalog with local inventory, shopping, cooking, and optional meal planning. The catalog is public and versioned in Git. Personal activity belongs to IndexedDB in one browser; there is no data server or login.

Start with the [documentation index](docs/README.md). Agents should read [AGENTS.md](AGENTS.md). Canonical domain language lives in [CONTEXT.md](CONTEXT.md), and [technical context](docs/technical-context.md) identifies what is implemented.

## Development

```sh
nvm use
npm ci
npm run dev
```

No credentials, environment file, or external database is needed. Development and production have separate browser storage because their origins differ.

```sh
npm run catalog:check
npm run docs:check
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Browser tests build and serve the production PWA. To try offline behavior manually, run `npm run build` followed by `npm run preview`, open the app online until its service worker is ready, then disconnect and reload. The development server deliberately does not install a service worker.

## Content and personal data

Use the [catalog authoring workflow](docs/catalog-authoring.md) to propose and accept foods or recipes through Codex. Production starts with empty food and recipe directories and five common units. Catalog acceptance does not commit, push, or deploy.

Closing the browser preserves personal data. Clearing site data can erase it; changing browser, profile, or origin does not transfer it. Offline use requires a previously completed online load. Manual export/import is a [future feature](docs/roadmap.md), not an available backup today.

See [operations](docs/architecture/operations.md) for static deployment. `npm run deploy` runs checks and publishes through Wrangler; execute it only when publication is requested.
