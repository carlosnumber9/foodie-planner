# Domain scenarios

These scenarios test agreed rules and seed future acceptance criteria.

## Cook before eating

On Sunday, the user cooks four servings of a recipe planned for Wednesday. `I cooked this` subtracts ingredients on Sunday and creates four prepared servings. One is explicitly assigned to Wednesday. `I ate this` consumes that serving on Wednesday without subtracting ingredients again.

## Cook without the calendar

The user cooks an unscheduled recipe. Ingredients are subtracted and servings remain unassigned. A serving can later be consumed from the recipe view through `I ate this`.

## Missing ingredients

A recipe planned for tomorrow needs 300 g of rice, while inventory holds 200 g. The app warns when the recipe is scheduled and again tomorrow. It does not add rice to shopping, block the recipe, or change inventory.

## Travel and past event time

The user records breakfast in Madrid and later changes the configured time zone to Miami. The breakfast keeps the same absolute instant but may display as 02:00 in Miami. Existing planned meals remain on their assigned civil dates and meal slots.

## Edit calendar after consumption

The user consumes a serving from a planned meal. Moving that calendar entry changes the associated plan shown in history but not the actual consumption instant. Deleting the entry removes the plan association and leaves the consumption in history as unplanned.

## Expired serving

A prepared serving passes its expiry date. The UI changes to the expired icon and explains it. The serving remains assignable, consumable, and removable.

## Remove a serving

The user removes a prepared serving. It disappears without a discard event, and its cooking ingredients are not returned to inventory.

## Edit a used recipe

A cooked recipe needs changes. Codex proposes and the user accepts a new revision. The library shows the current revision; existing plans, cooking, consumption, and assessments retain the original reference and nutrition. Archiving removes the recipe from new selections without breaking earlier references.

## Fixed food measurement type

Tomato is defined as count and salt as mass. Every recipe, inventory holding, and shopping entry for tomato uses count units; every salt quantity uses mass units. The app never compares tomato count with tomato mass.

## Undo cooking after a failed result

The user records a cooking event and later discards the failed dish. `Undo cooking` removes the prepared servings. The user chooses to keep the ingredient deductions because the ingredients were physically used. If the cooking event was entered by mistake instead, the user can reverse the ingredient deductions.

If any prepared serving from that event has already been consumed, the cooking event cannot be undone. Remaining servings can still be removed and inventory can be corrected manually.

## Update the catalog while planning

A plan references recipe revision 1, whose ingredients pin food revision 1. A new catalog release introduces food revision 2 and recipe revision 2. Existing plans still resolve revision 1; new selections use revision 2. No release resets IndexedDB.

## Work without connectivity

After the production app finishes its first online installation, disconnect and reopen a cached route. Catalog browsing and local settings still work without login or API calls. A failed storage write shows an error instead of success.

## Future export and restore

Export all personal state, clear site data, reopen online, and import the downloaded file. After confirming replacement, the same activity and exact catalog references are available. Reject an invalid or unsupported file without changing existing state. This scenario is pending the export/import roadmap feature.
