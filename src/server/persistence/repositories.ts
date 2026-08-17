import { asc, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import type { FoodRepository } from "../../application/food-service";
import type { MeasurementUnitRepository } from "../../application/measurement-unit-service";
import type { Food } from "../../domain/food";
import type { MeasurementUnit } from "../../domain/measurement";
import { foods, measurementUnits } from "./schema";
import type { FoodRow, MeasurementUnitRow } from "./schema";
import type * as schema from "./schema";

function mapFood(row: FoodRow): Food {
  return {
    id: row.id,
    name: row.name,
    measurementType: row.measurementType,
    defaultUnitId: row.defaultUnitId,
    category: row.category,
    iconKey: row.iconKey,
    nutrition: {
      energy: row.energy,
      protein: row.protein,
      carbohydrates: row.carbohydrates,
      fat: row.fat,
    },
    source: row.source,
    sourceIdentifier: row.sourceIdentifier,
    sourceVersion: row.sourceVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function foodValues(food: Food): typeof foods.$inferInsert {
  return {
    id: food.id,
    name: food.name,
    measurementType: food.measurementType,
    defaultUnitId: food.defaultUnitId,
    category: food.category,
    iconKey: food.iconKey,
    energy: food.nutrition.energy,
    protein: food.nutrition.protein,
    carbohydrates: food.nutrition.carbohydrates,
    fat: food.nutrition.fat,
    source: food.source,
    sourceIdentifier: food.sourceIdentifier,
    sourceVersion: food.sourceVersion,
    createdAt: food.createdAt,
    updatedAt: food.updatedAt,
  };
}

function mapMeasurementUnit(row: MeasurementUnitRow): MeasurementUnit {
  return {
    id: row.id,
    code: row.code,
    symbol: row.symbol,
    name: row.name,
    measurementType: row.measurementType,
    baseAmountPerUnit: row.baseAmountPerUnit,
    isBuiltIn: row.isBuiltIn,
    isActive: row.isActive,
  };
}

export function createRepositories(database: DrizzleD1Database<typeof schema>): {
  foods: FoodRepository;
  measurementUnits: MeasurementUnitRepository;
} {
  return {
    foods: {
      async list() {
        const rows = await database.select().from(foods).orderBy(asc(foods.name), asc(foods.id));
        return rows.map(mapFood);
      },
      async findById(id) {
        const [row] = await database.select().from(foods).where(eq(foods.id, id)).limit(1);
        return row === undefined ? null : mapFood(row);
      },
      async create(food) {
        await database.insert(foods).values(foodValues(food));
        return food;
      },
      async update(food) {
        await database.update(foods).set(foodValues(food)).where(eq(foods.id, food.id));
        return food;
      },
    },
    measurementUnits: {
      async list() {
        const rows = await database
          .select()
          .from(measurementUnits)
          .orderBy(asc(measurementUnits.measurementType), asc(measurementUnits.name));
        return rows.map(mapMeasurementUnit);
      },
      async findById(id) {
        const [row] = await database
          .select()
          .from(measurementUnits)
          .where(eq(measurementUnits.id, id))
          .limit(1);
        return row === undefined ? null : mapMeasurementUnit(row);
      },
      async create(unit) {
        await database.insert(measurementUnits).values(unit);
        return unit;
      },
      async setActive(id, active) {
        await database.update(measurementUnits).set({ isActive: active }).where(eq(measurementUnits.id, id));
      },
    },
  };
}
