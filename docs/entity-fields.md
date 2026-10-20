# Entity fields

Names below are canonical English domain names. Visible labels are Spanish. This describes agreed records; [technical context](technical-context.md) identifies implemented capabilities. There is no authentication entity.

Catalog references pin both `id` and `revision`. Food and recipe documents retain consecutive immutable `revisions`; recipes also have an `archived` flag. The [catalog schemas](../src/catalog/catalog.ts) are authoritative for JSON structure.

## Food

- `name`
- `measurementType`
- `defaultUnit`
- `category`
- optional `iconKey`, otherwise category fallback
- `energy`
- `protein`
- `carbohydrates`
- `fat`
- `source`: Ciqual or personal
- required source reference, version, and attribution

`measurementType` cannot change. Foods have no archive or delete action in R1. Meaningfully different product nutrition creates a separate personal food. Accepted corrections append revisions; existing references retain their earlier nutrition.

## Recipe

- `name`
- ordered `ingredients`
- ordered `steps`
- optional `preparationTime`
- optional `cookingTime`
- `tags`
- optional `note`
- calculated nutrition per serving
- active or archived state

A recipe has no base serving count.

## RecipeIngredient

- `recipe` reference with ID and revision
- `food` reference with ID and revision
- `amountPerServing`
- `unit`
- display order

The unit must belong to the food's measurement type.

## CookingEvent

- `recipe` reference with ID and revision
- `cookedAt`
- `servingCount`
- generated inventory movements
- generated prepared servings

`servingCount` is a positive integer. `cookedAt` defaults to now and remains editable. Undo is unavailable after any generated serving is consumed. Otherwise, undo removes the generated servings and either reverses or preserves ingredient deductions, according to explicit confirmation.

## PreparedServing

- `cookingEvent`
- optional `location`
- optional `expiresOn`
- optional calendar assignment

Location and expiry default from the values entered for the cooking event and can then differ by serving.

## Consumption

- `preparedServing`
- `consumedAt`
- optional current calendar association
- optional assessment note

Calendar edits can change or remove the association. They never change `consumedAt`.

## CulinaryAssessment

- `result`: bad, acceptable, or good
- `repeatIntent`: no, maybe, or yes

## WellbeingAssessment

- `satiety`: low, adequate, or high
- `digestion`: bad, normal, or good
- `energy`: low, normal, or high

Assessment values are optional and presented as labels, not numeric scores.

## Local settings and units

Implemented settings contain an IANA `timeZone`. Browser-only units contain a `personal-` ID, code, symbol, Spanish name, measurement type, base-unit factor, and activation. Catalog unit activation is stored as a local override. The future export covers these records alongside every implemented activity store.
