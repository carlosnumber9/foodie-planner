# Entity fields

Names in this document are canonical English domain names. Visible labels are Spanish. Database names will use `snake_case` when the physical schema is defined.

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
- optional source identifier and version

`measurementType` cannot change. Foods have no archive or delete action in R1. Meaningfully different product nutrition creates a separate personal food.

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

- `recipe`
- `food`
- `amountPerServing`
- `unit`
- display order

The unit must belong to the food's measurement type.

## CookingEvent

- `recipe`
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
