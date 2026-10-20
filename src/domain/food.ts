export const foodCategories = [
  "fruit",
  "vegetable",
  "meat",
  "fish",
  "cereal",
  "dairy",
  "legume",
  "condiment",
  "drink",
  "prepared_food",
  "generic_food",
] as const;

export type FoodCategory = (typeof foodCategories)[number];
