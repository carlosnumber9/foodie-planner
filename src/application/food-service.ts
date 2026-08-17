import {
  updateFood as applyFoodUpdate,
  type Food,
  type FoodCategory,
  type FoodUpdate,
} from "../domain/food";
import { assertCompatibleUnit, type MeasurementType } from "../domain/measurement";
import type { Nutrition } from "../domain/nutrition";
import { toScaledQuantity } from "../domain/quantity";
import { ApplicationError } from "./errors";
import type { MeasurementUnitRepository } from "./measurement-unit-service";

export interface FoodRepository {
  list(): Promise<Food[]>;
  findById(id: string): Promise<Food | null>;
  create(food: Food): Promise<Food>;
  update(food: Food): Promise<Food>;
}

interface NutritionInput {
  energy: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface CreatePersonalFoodInput {
  name: string;
  measurementType: MeasurementType;
  defaultUnitId: string;
  category: FoodCategory;
  iconKey: string | null;
  nutrition: NutritionInput;
}

export interface UpdateFoodInput {
  name?: string;
  measurementType?: MeasurementType;
  defaultUnitId?: string;
  category?: FoodCategory;
  iconKey?: string | null;
  nutrition?: NutritionInput;
}

interface FoodServiceDependencies {
  createId(): string;
  now(): number;
}

function scaleNutrition(nutrition: NutritionInput): Nutrition {
  return {
    energy: toScaledQuantity(nutrition.energy),
    protein: toScaledQuantity(nutrition.protein),
    carbohydrates: toScaledQuantity(nutrition.carbohydrates),
    fat: toScaledQuantity(nutrition.fat),
  };
}

async function requireCompatibleActiveUnit(
  units: MeasurementUnitRepository,
  unitId: string,
  measurementType: MeasurementType,
): Promise<void> {
  const unit = await units.findById(unitId);
  if (unit === null) {
    throw new ApplicationError(
      "measurement_unit_not_found",
      "not_found",
      "Measurement unit was not found",
    );
  }

  try {
    assertCompatibleUnit(measurementType, unit);
  } catch {
    throw new ApplicationError(
      "incompatible_unit",
      "conflict",
      "Measurement unit is incompatible with the food measurement type",
    );
  }

  if (!unit.isActive) {
    throw new ApplicationError(
      "inactive_measurement_unit",
      "conflict",
      "Measurement unit is inactive",
    );
  }
}

export function createFoodService(
  foods: FoodRepository,
  units: MeasurementUnitRepository,
  dependencies: FoodServiceDependencies,
) {
  return {
    list: () => foods.list(),

    async createPersonal(input: CreatePersonalFoodInput): Promise<Food> {
      await requireCompatibleActiveUnit(units, input.defaultUnitId, input.measurementType);
      const now = dependencies.now();
      const food: Food = {
        id: dependencies.createId(),
        name: input.name,
        measurementType: input.measurementType,
        defaultUnitId: input.defaultUnitId,
        category: input.category,
        iconKey: input.iconKey,
        nutrition: scaleNutrition(input.nutrition),
        source: "personal",
        sourceIdentifier: null,
        sourceVersion: null,
        createdAt: now,
        updatedAt: now,
      };

      return foods.create(food);
    },

    async update(id: string, input: UpdateFoodInput): Promise<Food> {
      const food = await foods.findById(id);
      if (food === null) {
        throw new ApplicationError("food_not_found", "not_found", "Food was not found");
      }

      if (food.source === "ciqual") {
        throw new ApplicationError(
          "catalog_food_immutable",
          "conflict",
          "Catalog foods are read-only; create a personal variant instead",
        );
      }

      if (input.measurementType !== undefined && input.measurementType !== food.measurementType) {
        throw new ApplicationError(
          "food_measurement_type_immutable",
          "conflict",
          "Food measurement type is immutable",
        );
      }

      if (input.defaultUnitId !== undefined) {
        await requireCompatibleActiveUnit(units, input.defaultUnitId, food.measurementType);
      }

      const { nutrition, ...fields } = input;
      const update: FoodUpdate =
        nutrition === undefined
          ? fields
          : {
              ...fields,
              nutrition: scaleNutrition(nutrition),
            };
      return foods.update(applyFoodUpdate(food, update, dependencies.now()));
    },
  };
}
