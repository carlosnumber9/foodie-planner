import type { MeasurementType } from "./measurement";
import {
  scaleQuantity,
  toScaledQuantity,
  type ScaledQuantity,
} from "./quantity";

export interface Nutrition {
  energy: ScaledQuantity;
  protein: ScaledQuantity;
  carbohydrates: ScaledQuantity;
  fat: ScaledQuantity;
}
const HUNDRED_BASE_UNITS = toScaledQuantity(100);
const ONE_COUNT_UNIT = toScaledQuantity(1);

export function nutritionReferenceAmount(measurementType: MeasurementType): ScaledQuantity {
  return measurementType === "count" ? ONE_COUNT_UNIT : HUNDRED_BASE_UNITS;
}

export function calculateNutritionForAmount(
  nutrition: Nutrition,
  measurementType: MeasurementType,
  amount: ScaledQuantity,
): Nutrition {
  const referenceAmount = nutritionReferenceAmount(measurementType);

  return {
    energy: scaleQuantity(nutrition.energy, amount, referenceAmount),
    protein: scaleQuantity(nutrition.protein, amount, referenceAmount),
    carbohydrates: scaleQuantity(nutrition.carbohydrates, amount, referenceAmount),
    fat: scaleQuantity(nutrition.fat, amount, referenceAmount),
  };
}
