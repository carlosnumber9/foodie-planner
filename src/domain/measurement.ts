import { scaleQuantity, type ScaledQuantity } from "./quantity";

export const measurementTypes = ["mass", "volume", "count"] as const;

export type MeasurementType = (typeof measurementTypes)[number];

export interface MeasurementUnit {
  id: string;
  code: string;
  symbol: string;
  name: string;
  measurementType: MeasurementType;
  baseAmountPerUnit: ScaledQuantity;
  isBuiltIn: boolean;
  isActive: boolean;
}
export function convertQuantity(
  amount: ScaledQuantity,
  source: MeasurementUnit,
  target: MeasurementUnit,
): ScaledQuantity {
  if (source.measurementType !== target.measurementType) {
    throw new TypeError("Measurement types must match");
  }

  if (source.baseAmountPerUnit <= 0 || target.baseAmountPerUnit <= 0) {
    throw new RangeError("Unit base factors must be positive");
  }

  return scaleQuantity(amount, source.baseAmountPerUnit, target.baseAmountPerUnit);
}

export function assertCompatibleUnit(
  measurementType: MeasurementType,
  unit: MeasurementUnit,
): void {
  if (measurementType !== unit.measurementType) {
    throw new TypeError("Unit must belong to the food measurement type");
  }
}
