import type { MeasurementType } from "./measurement";
import type { Nutrition } from "./nutrition";

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
export type FoodSource = "ciqual" | "personal";

export interface Food {
  id: string;
  name: string;
  measurementType: MeasurementType;
  defaultUnitId: string;
  category: FoodCategory;
  iconKey: string | null;
  nutrition: Nutrition;
  source: FoodSource;
  sourceIdentifier: string | null;
  sourceVersion: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface FoodUpdate {
  name?: string;
  measurementType?: MeasurementType;
  defaultUnitId?: string;
  category?: FoodCategory;
  iconKey?: string | null;
  nutrition?: Nutrition;
}

export function updateFood(food: Food, update: FoodUpdate, updatedAt: number): Food {
  if (update.measurementType !== undefined && update.measurementType !== food.measurementType) {
    throw new TypeError("Food measurement type is immutable");
  }

  return {
    ...food,
    ...update,
    measurementType: food.measurementType,
    updatedAt,
  };
}
