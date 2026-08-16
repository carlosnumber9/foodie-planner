# Foodie Planner

Foodie Planner organizes the household cycle connecting available food, recipes, cooking, prepared servings, shopping, and optional meal planning.

## Food and inventory

**Food**:
A reusable edible product referenced by recipe ingredients, inventory holdings, or shopping entries. It owns one immutable measurement type.
_Avoid_: Product, item

**Inventory**:
The collection of food holdings available at home.
_Avoid_: Pantry, stock

**Inventory holding**:
An available quantity of one food, optionally separated by location, batch, or expiry date.
_Avoid_: Stock, availability

**Inventory movement**:
A recorded change that increases, decreases, or corrects an inventory holding.
_Avoid_: Transaction, stock operation

**Shopping entry**:
A food manually added to the shopping list with a desired quantity.
_Avoid_: Missing food, pending product

## Recipes and cooking

**Recipe**:
A reusable definition of a dish through per-serving ingredients, method, and calculated nutrition data.
_Avoid_: Dish, meal

**Recipe ingredient**:
The use of one food within one recipe, with a quantity per serving and a compatible measurement unit.
_Avoid_: Ingredient

**Cooking event**:
The preparation of a recipe at an absolute instant, consuming ingredients and producing prepared servings.
_Avoid_: Meal, preparation

**Prepared serving**:
An edible portion produced by a cooking event that can still be assigned, consumed, or removed.
_Avoid_: Portion, leftover, container

**Consumption**:
The act of eating a prepared serving and removing it from available servings.
_Avoid_: Cooking, meal

## Planning

**Meal calendar**:
An optional plan placing recipes on dates and meal slots; it is not required to use recipes, cook, or consume servings.
_Avoid_: Menu, mandatory plan

**Meal slot**:
A configurable day category, such as breakfast, lunch, dinner, or snack, where a recipe can be placed.
_Avoid_: Shift, time block

**Serving assignment**:
An explicit link between a prepared serving and a recipe placed on the meal calendar.
_Avoid_: Reservation, planning

## Measurement and tracking

**Measurement type**:
One of the fixed kinds of measurable quantity: mass, volume, or count.
_Avoid_: Magnitude, unit

**Measurement unit**:
A built-in or user-defined unit belonging to one measurement type and convertible through that type's base unit.
_Avoid_: Magnitude, format

**Food measurement type**:
The immutable mass, volume, or count type assigned to one food and used by every quantity that references it.
_Avoid_: Food equivalence, alternate magnitude

**Culinary assessment**:
A post-consumption record about the dish result and desire to repeat it.
_Avoid_: Sensations

**Wellbeing assessment**:
A post-consumption record about satiety, digestion, and energy.
_Avoid_: Culinary assessment, medical symptoms
