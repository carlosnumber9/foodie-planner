# Foodie Planner

Personal web app connecting recipes, inventory, shopping, cooking, and optional meal planning without automated recommendations.

Start with the [documentation index](docs/README.md). Canonical domain language lives in [CONTEXT.md](CONTEXT.md).

## Development

```sh
nvm use
npm ci
cp .dev.vars.example .dev.vars
npm run dev
```

Useful checks:

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run mutation
npm run build
npm run db:check
```

Tests use repository and API mocks. They never connect to D1. Database migrations are generated and applied only through explicit commands; application startup never runs them.
