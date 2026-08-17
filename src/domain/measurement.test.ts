import { describe, expect, it } from "vitest";

import {
  assertCompatibleUnit,
  convertQuantity,
  type MeasurementUnit,
} from "./measurement";
import { toScaledQuantity } from "./quantity";

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

const kilogram: MeasurementUnit = {
  ...gram,
  id: "kilogram",
  code: "kg",
  symbol: "kg",
  name: "Kilogram",
  baseAmountPerUnit: toScaledQuantity(1_000),
};

const litre: MeasurementUnit = {
  ...gram,
  id: "litre",
  code: "l",
  symbol: "l",
  name: "Litre",
  measurementType: "volume",
  baseAmountPerUnit: toScaledQuantity(1_000),
};

describe("measurement conversion", () => {
  it.each([
    { amount: 1_000, source: gram, target: kilogram, expected: 1 },
    { amount: 1.5, source: kilogram, target: gram, expected: 1_500 },
    { amount: 333, source: gram, target: kilogram, expected: 0.33 },
  ])(
    "converts an amount between compatible units",
    ({ amount, source, target, expected }) => {
      const result = convertQuantity(toScaledQuantity(amount), source, target);
      expect(result).toBe(toScaledQuantity(expected));
    },
  );

  it("rejects cross-type conversion", () => {
    expect(() => convertQuantity(toScaledQuantity(1), gram, litre)).toThrow(
      "Measurement types must match",
    );
  });

  it("rejects a unit without a positive base factor", () => {
    expect(() =>
      convertQuantity(toScaledQuantity(1), { ...gram, baseAmountPerUnit: 0 }, kilogram),
    ).toThrow("Unit base factors must be positive");
  });

  it("rejects a target unit without a positive base factor", () => {
    expect(() =>
      convertQuantity(toScaledQuantity(1), gram, { ...kilogram, baseAmountPerUnit: 0 }),
    ).toThrow("Unit base factors must be positive");
  });

  it("accepts a unit from the food measurement type", () => {
    expect(() => assertCompatibleUnit("mass", gram)).not.toThrow();
  });

  it("rejects a unit from another food measurement type", () => {
    expect(() => assertCompatibleUnit("mass", litre)).toThrow(
      "Unit must belong to the food measurement type",
    );
  });
});
