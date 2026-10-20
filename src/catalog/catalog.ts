import { z } from "zod";

import { foodCategories } from "../domain/food";
import { measurementTypes, type MeasurementUnit } from "../domain/measurement";
import {
  calculateNutritionForAmount,
  type Nutrition,
} from "../domain/nutrition";
import { scaleQuantity } from "../domain/quantity";

const identifier = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/)
  .max(80);
const text = z.string().trim().min(1).max(500);
export const scaledQuantitySchema = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);
const positiveQuantity = scaledQuantitySchema.min(1);
const nutritionSchema = z.strictObject({
  energy: scaledQuantitySchema,
  protein: scaledQuantitySchema,
  carbohydrates: scaledQuantitySchema,
  fat: scaledQuantitySchema,
});

export const measurementUnitSchema = z.strictObject({
  id: identifier,
  code: text.max(24),
  symbol: text.max(16),
  name: text.max(80),
  measurementType: z.enum(measurementTypes),
  baseAmountPerUnit: positiveQuantity,
  isBuiltIn: z.boolean(),
  isActive: z.boolean(),
});

const foodRevisionSchema = z.strictObject({
  revision: z.number().int().positive(),
  name: text.max(120),
  measurementType: z.enum(measurementTypes),
  defaultUnitId: identifier,
  category: z.enum(foodCategories),
  iconKey: text.max(80).nullable(),
  nutrition: nutritionSchema,
  source: z.strictObject({
    type: z.enum(["ciqual", "personal"]),
    reference: text,
    version: text,
    attribution: text,
  }),
});

const recipeRevisionSchema = z.strictObject({
  revision: z.number().int().positive(),
  name: text.max(120),
  ingredients: z
    .array(
      z.strictObject({
        foodId: identifier,
        foodRevision: z.number().int().positive(),
        amountPerServing: positiveQuantity,
        unitId: identifier,
      }),
    )
    .min(1),
  steps: z.array(text.max(4000)).min(1),
  tags: z
    .array(text.max(80))
    .refine((tags) => new Set(tags).size === tags.length, "Duplicate tag"),
  preparationTime: z.number().int().nonnegative().nullable(),
  cookingTime: z.number().int().nonnegative().nullable(),
  note: text.max(4000).nullable(),
});

export const foodDocumentSchema = z.strictObject({
  id: identifier,
  revisions: z.array(foodRevisionSchema).min(1),
});
export const recipeDocumentSchema = z.strictObject({
  id: identifier,
  archived: z.boolean(),
  revisions: z.array(recipeRevisionSchema).min(1),
});

export type FoodDocument = z.infer<typeof foodDocumentSchema>;
export type RecipeDocument = z.infer<typeof recipeDocumentSchema>;
export type FoodRevision = FoodDocument["revisions"][number];
export type RecipeRevision = RecipeDocument["revisions"][number];
export interface CatalogReference {
  id: string;
  revision: number;
}
export interface Catalog {
  units: MeasurementUnit[];
  foods: FoodDocument[];
  recipes: RecipeDocument[];
}

export function canonicalJson(value: unknown): string {
  function order(entry: unknown): unknown {
    if (Array.isArray(entry)) return entry.map(order);
    if (entry !== null && typeof entry === "object") {
      return Object.fromEntries(
        Object.entries(entry)
          .sort(([a], [b]) => a.localeCompare(b, "en"))
          .map(([key, child]) => [key, order(child)]),
      );
    }
    return entry;
  }
  return `${JSON.stringify(order(value), null, 2)}\n`;
}

export function parseCatalog(input: unknown): Catalog {
  const catalog = z
    .strictObject({
      units: z.array(measurementUnitSchema),
      foods: z.array(foodDocumentSchema),
      recipes: z.array(recipeDocumentSchema),
    })
    .parse(input);
  for (const records of [catalog.units, catalog.foods, catalog.recipes]) {
    if (new Set(records.map((record) => record.id)).size !== records.length)
      throw new Error("Duplicate catalog identifier");
  }
  if (
    new Set(catalog.units.map((unit) => unit.code)).size !==
    catalog.units.length
  )
    throw new Error("Duplicate unit code");
  const units = new Map(catalog.units.map((unit) => [unit.id, unit]));
  for (const unit of catalog.units) {
    if (!unit.isBuiltIn || !unit.isActive)
      throw new Error("Catalog units must be built-in and active");
  }
  for (const document of [...catalog.foods, ...catalog.recipes]) {
    document.revisions.forEach((revision, index) => {
      if (revision.revision !== index + 1)
        throw new Error(`Revisions must be consecutive: ${document.id}`);
    });
  }
  for (const food of catalog.foods) {
    for (const revision of food.revisions) {
      if (revision.measurementType !== food.revisions[0].measurementType)
        throw new Error(`Food measurement type is immutable: ${food.id}`);
      if (
        units.get(revision.defaultUnitId)?.measurementType !==
        revision.measurementType
      )
        throw new Error(`Incompatible food unit: ${food.id}`);
    }
  }
  for (const recipe of catalog.recipes) {
    for (const revision of recipe.revisions) {
      for (const ingredient of revision.ingredients) {
        const food = resolveFood(catalog, {
          id: ingredient.foodId,
          revision: ingredient.foodRevision,
        });
        if (
          units.get(ingredient.unitId)?.measurementType !== food.measurementType
        )
          throw new Error(`Incompatible recipe unit: ${recipe.id}`);
      }
      calculateRecipeNutrition(catalog, revision);
    }
  }
  return catalog;
}

export function resolveFood(
  catalog: Catalog,
  reference: CatalogReference,
): FoodRevision {
  const revision = catalog.foods
    .find((food) => food.id === reference.id)
    ?.revisions.find((entry) => entry.revision === reference.revision);
  if (!revision)
    throw new Error(
      `Food revision not found: ${reference.id}@${reference.revision}`,
    );
  return revision;
}

export function resolveRecipe(
  catalog: Catalog,
  reference: CatalogReference,
): RecipeRevision {
  const revision = catalog.recipes
    .find((recipe) => recipe.id === reference.id)
    ?.revisions.find((entry) => entry.revision === reference.revision);
  if (!revision)
    throw new Error(
      `Recipe revision not found: ${reference.id}@${reference.revision}`,
    );
  return revision;
}

export function calculateRecipeNutrition(
  catalog: Catalog,
  recipe: RecipeRevision,
): Nutrition {
  const total: Nutrition = { energy: 0, protein: 0, carbohydrates: 0, fat: 0 };
  for (const ingredient of recipe.ingredients) {
    const food = resolveFood(catalog, {
      id: ingredient.foodId,
      revision: ingredient.foodRevision,
    });
    const unit = catalog.units.find((entry) => entry.id === ingredient.unitId);
    if (!unit || unit.measurementType !== food.measurementType)
      throw new Error("Incompatible recipe unit");
    const amount = scaleQuantity(
      ingredient.amountPerServing,
      unit.baseAmountPerUnit,
      100,
    );
    const nutrition = calculateNutritionForAmount(
      food.nutrition,
      food.measurementType,
      amount,
    );
    for (const key of Object.keys(total) as (keyof Nutrition)[]) {
      total[key] += nutrition[key];
      if (!Number.isSafeInteger(total[key]))
        throw new RangeError("Recipe nutrition exceeds the supported range");
    }
  }
  return total;
}

export function assertCatalogEvolution(previous: Catalog, next: Catalog): void {
  for (const kind of ["foods", "recipes"] as const) {
    for (const oldDocument of previous[kind]) {
      const document = next[kind].find((entry) => entry.id === oldDocument.id);
      if (!document)
        throw new Error(
          `Catalog document cannot be deleted: ${oldDocument.id}`,
        );
      for (const revision of oldDocument.revisions) {
        if (
          canonicalJson(
            document.revisions.find(
              (entry) => entry.revision === revision.revision,
            ),
          ) !== canonicalJson(revision)
        ) {
          throw new Error(
            `Existing revision is immutable: ${oldDocument.id}@${revision.revision}`,
          );
        }
      }
    }
  }
  for (const unit of previous.units) {
    if (
      canonicalJson(next.units.find((entry) => entry.id === unit.id)) !==
      canonicalJson(unit)
    )
      throw new Error(`Catalog unit is immutable: ${unit.id}`);
  }
}
