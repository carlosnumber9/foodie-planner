import { describe, expect, it, vi } from "vitest";

import type { Food } from "../domain/food";
import type { MeasurementUnit } from "../domain/measurement";
import { toScaledQuantity } from "../domain/quantity";
import type { ApplicationError } from "./errors";
import { createFoodService, type FoodRepository } from "./food-service";
import type { MeasurementUnitRepository } from "./measurement-unit-service";

const gram: MeasurementUnit = {
  id: "gram",
  code: "g",
  symbol: "g",
  name: "Gram",
  measurementType: "mass",
  baseAmountPerUnit: toScaledQuantity(1),
  isBuiltIn: true,
  isActive: true,
};

const food: Food = {
  id: "food-1",
  name: "Tomato",
  measurementType: "mass",
  defaultUnitId: "gram",
  category: "vegetable",
  iconKey: null,
  nutrition: {
    energy: toScaledQuantity(18),
    protein: toScaledQuantity(0.9),
    carbohydrates: toScaledQuantity(3.9),
    fat: toScaledQuantity(0.2),
  },
  source: "personal",
  sourceIdentifier: null,
  sourceVersion: null,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

function createRepositories() {
  const foods: FoodRepository = {
    list: vi.fn().mockResolvedValue([food]),
    findById: vi.fn().mockResolvedValue(food),
    create: vi.fn(async (value: Food) => value),
    update: vi.fn(async (value: Food) => value),
  };
  const units: MeasurementUnitRepository = {
    list: vi.fn().mockResolvedValue([gram]),
    findById: vi.fn().mockResolvedValue(gram),
    create: vi.fn(async (value: MeasurementUnit) => value),
    setActive: vi.fn(),
  };
  return { foods, units };
}

describe("food service", () => {
  it("lists foods from the repository", async () => {
    const repositories = createRepositories();
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "unused",
      now: () => 0,
    });

    await expect(service.list()).resolves.toEqual([food]);
  });

  it("creates a personal food with scaled nutrition", async () => {
    const repositories = createRepositories();
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "food-2",
      now: () => 1_800_000_000_000,
    });

    await expect(
      service.createPersonal({
        name: "Lentils",
        measurementType: "mass",
        defaultUnitId: "gram",
        category: "legume",
        iconKey: null,
        nutrition: { energy: 116, protein: 9.02, carbohydrates: 20.13, fat: 0.38 },
      }),
    ).resolves.toMatchObject({
      id: "food-2",
      source: "personal",
      sourceIdentifier: null,
      nutrition: {
        energy: 11_600,
        protein: 902,
        carbohydrates: 2_013,
        fat: 38,
      },
    });
    expect(repositories.foods.create).toHaveBeenCalledOnce();
  });

  it.each([
    {
      unit: null,
      code: "measurement_unit_not_found",
      kind: "not_found",
      message: "Measurement unit was not found",
    },
    {
      unit: { ...gram, measurementType: "volume" as const },
      code: "incompatible_unit",
      kind: "conflict",
      message: "Measurement unit is incompatible with the food measurement type",
    },
    {
      unit: { ...gram, isActive: false },
      code: "inactive_measurement_unit",
      kind: "conflict",
      message: "Measurement unit is inactive",
    },
  ] as const)("rejects an unusable default unit with $code", async ({ unit, code, kind, message }) => {
    const repositories = createRepositories();
    vi.mocked(repositories.units.findById).mockResolvedValue(unit);
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "food-2",
      now: () => 1_800_000_000_000,
    });

    await expect(
      service.createPersonal({
        name: "Lentils",
        measurementType: "mass",
        defaultUnitId: "gram",
        category: "legume",
        iconKey: null,
        nutrition: { energy: 116, protein: 9.02, carbohydrates: 20.13, fat: 0.38 },
      }),
    ).rejects.toMatchObject({ code, kind, message } satisfies Partial<ApplicationError>);
    expect(repositories.foods.create).not.toHaveBeenCalled();
  });

  it("updates editable food data", async () => {
    const repositories = createRepositories();
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "unused",
      now: () => 1_800_000_000_000,
    });

    await expect(service.update("food-1", { name: "Cherry tomato" })).resolves.toMatchObject({
      name: "Cherry tomato",
      measurementType: "mass",
      nutrition: food.nutrition,
      updatedAt: 1_800_000_000_000,
    });
    expect(repositories.units.findById).not.toHaveBeenCalled();
  });

  it("validates a changed default unit", async () => {
    const repositories = createRepositories();
    const kilogram = { ...gram, id: "kilogram", code: "kg", symbol: "kg", baseAmountPerUnit: 100_000 };
    vi.mocked(repositories.units.findById).mockResolvedValue(kilogram);
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "unused",
      now: () => 1_800_000_000_000,
    });

    await expect(service.update("food-1", { defaultUnitId: "kilogram" })).resolves.toMatchObject({
      defaultUnitId: "kilogram",
    });
    expect(repositories.units.findById).toHaveBeenCalledWith("kilogram");
  });

  it("scales updated nutrition", async () => {
    const repositories = createRepositories();
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "unused",
      now: () => 1_800_000_000_000,
    });

    await expect(
      service.update("food-1", {
        nutrition: { energy: 20, protein: 1.25, carbohydrates: 4.5, fat: 0.1 },
      }),
    ).resolves.toMatchObject({
      nutrition: { energy: 2_000, protein: 125, carbohydrates: 450, fat: 10 },
    });
  });

  it("reports a missing food", async () => {
    const repositories = createRepositories();
    vi.mocked(repositories.foods.findById).mockResolvedValue(null);
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "unused",
      now: () => 0,
    });

    await expect(service.update("missing", { name: "Missing" })).rejects.toMatchObject({
      code: "food_not_found",
      kind: "not_found",
      message: "Food was not found",
    } satisfies Partial<ApplicationError>);
  });

  it("keeps curated catalog foods read-only", async () => {
    const repositories = createRepositories();
    vi.mocked(repositories.foods.findById).mockResolvedValue({
      ...food,
      source: "ciqual",
      sourceIdentifier: "25163",
      sourceVersion: "2025",
    });
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "unused",
      now: () => 1_800_000_000_000,
    });

    await expect(service.update("food-1", { nutrition: { energy: 20, protein: 1, carbohydrates: 4, fat: 0 } })).rejects.toMatchObject({
      code: "catalog_food_immutable",
      kind: "conflict",
      message: "Catalog foods are read-only; create a personal variant instead",
    } satisfies Partial<ApplicationError>);
    expect(repositories.foods.update).not.toHaveBeenCalled();
  });

  it("preserves the immutable food measurement type", async () => {
    const repositories = createRepositories();
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "unused",
      now: () => 1_800_000_000_000,
    });

    await expect(service.update("food-1", { measurementType: "count" })).rejects.toMatchObject({
      code: "food_measurement_type_immutable",
      kind: "conflict",
      message: "Food measurement type is immutable",
    } satisfies Partial<ApplicationError>);
    expect(repositories.foods.update).not.toHaveBeenCalled();
  });

  it("accepts an explicitly unchanged food measurement type", async () => {
    const repositories = createRepositories();
    const service = createFoodService(repositories.foods, repositories.units, {
      createId: () => "unused",
      now: () => 1_800_000_000_000,
    });

    await expect(service.update("food-1", { measurementType: "mass" })).resolves.toMatchObject({
      measurementType: "mass",
    });
  });
});
