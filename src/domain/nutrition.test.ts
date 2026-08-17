import { describe, expect, it } from "vitest";

import { calculateNutritionForAmount, type Nutrition } from "./nutrition";
import { toScaledQuantity } from "./quantity";

const nutrition: Nutrition = {
  energy: toScaledQuantity(80),
  protein: toScaledQuantity(2.5),
  carbohydrates: toScaledQuantity(10),
  fat: toScaledQuantity(3),
};

describe("nutrition calculation", () => {
  it.each([
    { measurementType: "mass" as const, amount: 100, multiplier: 1 },
    { measurementType: "volume" as const, amount: 250, multiplier: 2.5 },
    { measurementType: "count" as const, amount: 3, multiplier: 3 },
  ])(
    "scales $measurementType nutrition using its reference amount",
    ({ measurementType, amount, multiplier }) => {
      expect(calculateNutritionForAmount(nutrition, measurementType, toScaledQuantity(amount))).toEqual({
        energy: toScaledQuantity(80 * multiplier),
        protein: toScaledQuantity(2.5 * multiplier),
        carbohydrates: toScaledQuantity(10 * multiplier),
        fat: toScaledQuantity(3 * multiplier),
      });
    },
  );
});
