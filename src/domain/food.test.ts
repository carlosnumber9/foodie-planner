import { describe, expect, it } from "vitest";

import { updateFood, type Food } from "./food";
import { toScaledQuantity } from "./quantity";

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

describe("food updates", () => {
  it("updates editable fields while preserving measurement type", () => {
    expect(updateFood(food, { name: "Cherry tomato" }, 1_800_000_000_000)).toMatchObject({
      name: "Cherry tomato",
      measurementType: "mass",
      updatedAt: 1_800_000_000_000,
    });
  });

  it("rejects a measurement type change", () => {
    expect(() => updateFood(food, { measurementType: "count" }, 1_800_000_000_000)).toThrow(
      "Food measurement type is immutable",
    );
  });

  it("accepts an explicitly unchanged measurement type", () => {
    expect(updateFood(food, { measurementType: "mass" }, 1_800_000_000_000)).toMatchObject({
      measurementType: "mass",
      updatedAt: 1_800_000_000_000,
    });
  });
});
