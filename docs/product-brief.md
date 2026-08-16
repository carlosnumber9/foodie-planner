# Product brief

## Problem

Home cooking data is usually fragmented: available food, recipe quantities, shopping needs, cooking events, prepared servings, and meal outcomes. Foodie Planner connects that cycle in one simple personal web app.

## Proposition

Foodie Planner is a deterministic record keeper. The user creates recipes, maintains inventory and shopping, records cooking and consumption, and optionally places recipes on a calendar. The app calculates quantities, explicit conversions, and nutrition; it does not recommend recipes, generate menus, or decide what to eat.

## Initial user

The first version serves one person and synchronizes data between macOS and iPhone. It has no shared households, roles, or collaboration permissions.

## Principles

1. The calendar is optional; recipes, inventory, shopping, and cooking work without it.
2. Cooking and eating are separate facts. Cooking consumes ingredients and produces servings; eating consumes a prepared serving.
3. The app informs and warns but does not block decisions or act for the user.
4. Calculations are explainable. Each food uses one fixed measurement type, so cross-type estimates are unnecessary.
5. Daily upkeep must fit within five minutes.
6. Personal recipes are the only library; there is no assistant, recommendation engine, or web recipe import.
7. The MVP requires a network connection for reads and writes.
8. The interface is Spanish-only and does not prepare for future localization.

## Current exclusions

- AI-generated recipes or menus.
- Recommendations based on inventory, preferences, or goals.
- Public or community recipe catalogs.
- Automatic calendar planning.
- Household collaboration.
- Blocking based on nutrition goals, missing ingredients, or expiry.
- Offline use in the MVP.
