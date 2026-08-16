# Persistence

## Model

D1 uses explicit relational tables with English `snake_case` names, foreign keys, and constraints. The schema represents domain concepts directly; it does not store the application as a generic document or event stream.

Quantities are scaled integers representing hundredths. UTC instants use integer timestamps. Calendar dates use `YYYY-MM-DD` text because they are civil dates rather than instants. Time zones use IANA identifiers.

Drizzle defines the schema, generates migrations, and handles ordinary typed queries. Explicit D1 prepared statements remain available when an atomic command benefits from direct control.

## Atomic commands

One D1 batch commits every write belonging to a state-changing domain command:

- Cooking creates the event, deducts inventory, records movements, and creates prepared servings.
- Consumption updates the serving and creates the consumption record.
- Purchase confirmation updates shopping state and adds inventory.
- Cooking undo removes generated servings and optionally creates inverse inventory movements.
- Calendar assignment or movement updates the calendar entry and serving assignment together.

If one statement fails, the command fails without a partial successful state.

## Development and tests

The local interactive application and deployed application use the single production D1 database. Tests mock persistence and never connect to D1.

## Migrations and recovery

Migrations live in the repository and run only through an explicit production command. They never run during application startup. A D1 Time Travel bookmark is recorded before each migration. If a migration causes a serious problem, restoration is a manual operator action.
