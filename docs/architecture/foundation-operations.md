# Foundation operations

## Local runtime

Use the pinned Node.js release and the public npm registry:

```sh
nvm use
npm ci
```

Copy `.dev.vars.example` to `.dev.vars` to enable the explicit local development identity. This bypass exists only when `APP_ENVIRONMENT=development`. Production requests require a verified `Cf-Access-Jwt-Assertion` with the configured `TEAM_DOMAIN` issuer and `POLICY_AUD` audience.

Interactive local development must use the single production D1 binding with `remote: true`. The binding is intentionally commented out in `wrangler.jsonc` until the approved EU D1 database exists. Add its real `database_id`; never leave the ID out because Wrangler can automatically provision a different database.

Automated tests inject repository mocks. They must not add a D1 binding, create a database, or run migrations.

## Production migration

Migrations never run during application startup, development startup, tests, or the application build. Before applying a production migration:

1. Review the SQL migration in `db/migrations`.
2. Record a D1 Time Travel bookmark for the production database.
3. Apply the migration through an explicit Wrangler command.
4. Verify the application and retain the bookmark for manual recovery within the supported window.

Provisioning D1, configuring Access, adding production binding values, applying migrations, connecting Workers Builds, and deploying require explicit user approval.

The PWA icons are temporary local raster placeholders. Replace them only after the final visual direction and selected Koboyo SVG assets are available.
