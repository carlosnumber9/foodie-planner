# Functional specification

This document records agreed behavior. It does not yet define visual design, architecture, or technology.

## Recipe library

- Active recipes include per-serving ingredients, steps, tags, and calculated nutrition.
- A recipe ingredient references one food and stores its quantity per serving and chosen compatible unit.
- Cooking quantities scale each ingredient's per-serving amount by the selected serving count, including decimals.
- A recipe also stores optional preparation time, cooking time, and note.
- An unused recipe can be edited in place.
- Editing a used recipe creates a separate active recipe; history keeps the original.
- Deleting a recipe archives it. Archived recipes preserve calendar and history references.
- Recipes are created manually through a guided form and can be duplicated.

## Measurements

- Fixed measurement types are mass, volume, and count.
- The app includes common measurement units.
- Settings can activate, hide, or create units within a fixed type using a base-unit factor.
- Compatible conversions, such as grams and kilograms, are exact.
- Every food has one immutable measurement type: mass, volume, or count.
- The same real-world ingredient can have separate foods for different types, such as `Tomato (count)` and `Tomato (g)`.
- Recipe, inventory, and shopping quantities for one food always use units from its assigned type.
- Cross-type food equivalences do not exist.
- Each recipe ingredient keeps its chosen unit.

## Foods

- Foods have no archive state and R1 offers no delete action.
- A food's visible field is named `Magnitude`; its value cannot be changed after creation.
- Different magnitudes for the same real-world ingredient are separate foods.

## Inventory

- Inventory combines automatic movements with manual corrections.
- Foods needing precision keep exact quantities; pantry basics may use approximate information.
- Total quantity is required. Batch, location, and expiry are optional.
- Confirming a purchase adds its actual quantity after allowing corrections to quantity, package, price, and optional details.
- A cooking event subtracts ingredients when cooking occurs, even if the recipe is scheduled for another date.

## Shopping list

- Shopping is manual and shows one final quantity per food.
- The calendar never adds, edits, or removes shopping entries.
- Completing a purchase requires confirming the actual quantity before adding it to inventory.

## Cooking and prepared servings

- `I cooked this` asks only for serving count. Its instant defaults to now and remains editable.
- Cooking serving count is a positive integer.
- Recording cooking immediately subtracts ingredients and creates separate prepared servings.
- Optional location and expiry entered during cooking apply initially to every produced serving; each serving can be edited later.
- Servings from one cooking event stay grouped while they share relevant state.
- A serving can be explicitly assigned to a calendar date and meal slot or remain unassigned.
- A recipe view groups assigned servings by day and shows unassigned prepared servings in a separate card.
- `I ate this` consumes a prepared serving without requiring a calendar entry.
- A serving can be removed directly. Removal leaves no history and does not return ingredients.
- Undoing a cooking event removes its prepared servings and asks whether its ingredient deductions should be reversed or kept.
- A cooking event cannot be undone after any serving it produced has been consumed.
- Location and expiry are optional. One icon warns from two days before expiry and another marks expiry; both support hover, tap, and accessible text.
- An expired serving can still be assigned, consumed, or removed. The app warns but never blocks.

## Meal calendar

- Calendar use is optional.
- Each day has configurable meal slots. Defaults are breakfast, lunch, dinner, and snacks.
- Each slot shows only the planned dish.
- Scheduling a recipe includes a serving count.
- Missing ingredients trigger a warning when scheduled and again on the planned day. Warnings do not change shopping or block actions.
- A prepared serving can be optionally and explicitly assigned to a calendar entry.
- Moving a calendar entry moves its serving assignment. Deleting the entry leaves the prepared serving unassigned; it never removes the serving or restores ingredients.
- After consumption, moving or deleting the calendar entry updates the calendar association shown in history but never changes the actual consumption instant. Deleting the entry leaves an unplanned consumption record.

## Time zone behavior

- One user setting controls the display time zone and the local day used for new actions.
- Cooking and consumption events preserve one absolute instant. Past events display in the currently configured time zone, so their visible clock time or calendar day may change after travel.
- Existing planned meals keep their civil date and meal slot when the configured time zone changes.
- A time-zone change affects how future actions determine their local day; it never changes the stored instant of a past event.

## Nutrition

- A curated and translated subset of a few hundred common ANSES Ciqual 2025 foods provides the initial catalog under its required attribution.
- Nutrition is expressed per 100 g for mass foods, per 100 ml for volume foods, and per unit for count foods.
- Catalog nutrition is a practical estimate. Small differences from a purchased product require no correction.
- A meaningful label difference is represented by duplicating the food as a personal variant and editing its nutrition values.
- Nutrition never varies by inventory holding, batch, or purchase.
- The app calculates recipe, serving, and daily totals.
- Daily goals are informational. They do not generate plans, recommendations, alerts, or blocks.

## Assessments and history

- After consumption, one quick check-in can be edited during that day.
- The optional check-in opens after `I ate this`, can be dismissed, and remains available from history for the rest of that local day.
- Culinary assessment records dish outcome and desire to repeat it.
- Wellbeing assessment records satiety, digestion, and energy.
- Culinary result uses bad, acceptable, or good. Repeat intent uses no, maybe, or yes.
- Satiety uses low, adequate, or high. Digestion uses bad, normal, or good. Energy uses low, normal, or high.
- Every assessment field is optional and displays labels rather than numeric scores.
- A free-text note is optional.
- History shows when recipes were cooked and consumed and their assessments.
- R1 history is chronological and filters by recipe, event type, and date.
- R1 has no charts or aggregate statistics.

## Navigation and discovery

- Recipes are the initial screen.
- Primary destinations are Recipes, Calendar, Inventory, Shopping, and More.
- More contains History and Settings.
- Mobile uses bottom navigation; desktop uses a sidebar.
- Recipe filters are text and tags.
- Food filters are text, category, and measurement type.
- Inventory filters are text, category, location, and expiry state.
- Shopping filters are text and pending or completed state.
- R1 has no advanced query builder or saved filters.

## Preferences

- Simple filters represent restrictions and tastes.
- No assistant interprets preferences or proposes recipes.

## Connectivity

- The MVP requires an internet connection to read or change data.
- Offline caching, offline reads, queued writes, and conflict resolution are outside MVP scope.
