export const QUANTITY_SCALE = 100;

export type ScaledQuantity = number;

export function toScaledQuantity(value: number): ScaledQuantity {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError("Quantity must be a finite non-negative number");
  }

  const scaled = Math.round((value + Number.EPSILON * Math.max(1, value)) * QUANTITY_SCALE);
  if (!Number.isSafeInteger(scaled)) {
    throw new RangeError("Quantity exceeds the supported range");
  }

  return scaled;
}
export function fromScaledQuantity(value: ScaledQuantity): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("Scaled quantity must be a non-negative safe integer");
  }

  return value / QUANTITY_SCALE;
}

export function scaleQuantity(
  value: ScaledQuantity,
  numerator: ScaledQuantity,
  denominator: ScaledQuantity,
): ScaledQuantity {
  if (denominator <= 0) {
    throw new RangeError("Scale denominator must be positive");
  }

  const product = value * numerator;
  if (!Number.isSafeInteger(product)) {
    throw new RangeError("Quantity calculation exceeds the supported range");
  }

  return Math.floor((product + denominator / 2) / denominator);
}
