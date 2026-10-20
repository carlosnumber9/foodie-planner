# Roadmap

This document owns delivery order. The [technical context](technical-context.md) describes implemented behavior; the functional specification also includes pending workflows.

## Foundation: static catalog and local activity

- Replace Worker APIs, D1, and login with public static hosting.
- Establish validated, revisioned JSON catalogs, read-only browsing, and Codex authoring skills; start without food or recipe content.
- Establish IndexedDB settings, personal units, activation overrides, migrations, transactions, and explicit errors.
- Deliver production offline caching and manual updates that protect drafts and personal activity.
- Align documentation and agent instructions with the new ownership model.

## Inventory and shopping

Implement holdings, movements, corrections, optional batches/location/expiry, manual shopping, and purchase confirmation. Persist each complete domain command atomically in IndexedDB.

## Recipes and cooking

Populate foods from reviewed Ciqual sources and labels through the catalog skills. Add accepted recipes, scaling, cooking deductions, prepared servings, assignment, consumption, removal, and expiry warnings. Preserve revision references throughout.

## Optional calendar

Implement meal slots, scheduling with serving counts, explicit prepared-serving assignments, missing-food warnings, and movement/deletion rules. Plans keep their selected recipe revision until explicitly replaced.

## Tracking and hardening

Implement informational nutrition goals, assessments, and chronological history. Verify accessibility, reduced motion, storage failure feedback, update continuity, and daily upkeep time. Complete critical mutation testing before R1 delivery.

## Future feature: manual export and import

Download a versioned JSON file containing all personal state that can be lost from browser storage: calendars, inventory, shopping, cooking events, prepared servings, consumptions, assessments, settings, personal units, and activation overrides. Preserve exact catalog revision references. Restore that file after clearing site data or transfer it to another session, browser, or profile.

Validate the whole file and references before changing state. Initial import replaces local state only after confirmation and commits atomically; it does not merge automatically. Test export, site-data deletion, and import for equivalent restored state. Invalid or unsupported files must leave existing data untouched.

This feature is not implemented in the foundation. There is no automatic backup or device synchronization.

## Other later candidates

Optional recipe imagery and aggregate statistics remain candidates, not accepted implementation requirements. No image storage service is introduced by this transition.
