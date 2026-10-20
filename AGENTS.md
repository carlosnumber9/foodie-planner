# Working in Foodie Planner

## Orientation

Read [README.md](README.md) for setup and [docs/README.md](docs/README.md) to select task-specific documentation. Read [CONTEXT.md](CONTEXT.md) when using domain terminology. [Technical context](docs/technical-context.md) distinguishes implemented behavior from the [roadmap](docs/roadmap.md).

The app is static: repository JSON owns the public catalog; IndexedDB owns private browser activity. Keep domain rules independent of React and persistence. Do not reintroduce a remote database, API, authentication, or telemetry without a new product decision.

## Task routing

- Catalog changes: use the food or recipe skill under `docs/skills`, discovered through `.agents/skills`, and follow [catalog authoring](docs/catalog-authoring.md).
- Domain behavior: consult the functional specification, entity fields, and relevant scenarios linked from the documentation index.
- Persistence, offline behavior, or deployment: consult the corresponding architecture document.
- Change behavior and its authoritative documentation together. Keep `CONTEXT.md` a glossary; record consequential trade-offs in concise ADRs. Preserve superseded decisions as history.

## Verification

Use Node from `.nvmrc` and `npm ci`. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Run `npm run test:e2e` for browser, persistence, or PWA changes; it serves a production build. Run `npm run catalog:check` for catalog changes and `npm run docs:check` for documentation changes. Follow [quality strategy](docs/architecture/quality-strategy.md) for critical domain changes.

## Git operations

For ordinary commit and push requests, use only the local `git` CLI. Before creating a commit, read [docs/git-workflow.md](docs/git-workflow.md). Do not use `gh`, `github:yeet`, the GitHub plugin, connector, or app unless the user explicitly requests a GitHub or pull request workflow. Commit and push never authorizes a PR. Follow an explicit user commit convention; otherwise use the repository convention. Preserve unrelated working-tree changes.

## Communication

Start each new task using the installed `caveman` skill in full mode. Keep it active unless the user says normal mode, stop caveman, or requests normal or expanded prose; that override lasts for the current task. Follow its Auto-Clarity and Boundaries rules: security warnings, irreversible confirmations, ambiguous procedures, and all persisted code, comments, documentation, commit messages, and PR text use normal prose. Direct user instructions take precedence.

Source identifiers and documentation use English. Visible application copy uses Spanish.
