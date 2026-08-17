import { describe, expect, it } from "vitest";

import {
  fromScaledQuantity,
  scaleQuantity,
  toScaledQuantity,
} from "./quantity";

describe("scaled quantity", () => {
  it.each([
    { value: 0, scaled: 0 },
    { value: 1, scaled: 100 },
    { value: 1.234, scaled: 123 },
    { value: 1.235, scaled: 124 },
    { value: 2.015, scaled: 202 },
    { value: 1_000.999, scaled: 100_100 },
  ])("rounds $value to $scaled hundredths", ({ value, scaled }) => {
    expect(toScaledQuantity(value)).toBe(scaled);
    expect(fromScaledQuantity(scaled)).toBe(scaled / 100);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid quantity %s",
    (value) => {
      expect(() => toScaledQuantity(value)).toThrow("Quantity must be a finite non-negative number");
    },
  );

  it("rejects quantities outside the safe integer range", () => {
    expect(() => toScaledQuantity(Number.MAX_SAFE_INTEGER)).toThrow(
      "Quantity exceeds the supported range",
    );
  });

  it.each([-1, 1.5, Number.POSITIVE_INFINITY])(
    "rejects invalid scaled quantity %s",
    (value) => {
      expect(() => fromScaledQuantity(value)).toThrow(
        "Scaled quantity must be a non-negative safe integer",
      );
    },
  );

  it.each([0, -1])("rejects scale denominator %s", (denominator) => {
    expect(() => scaleQuantity(100, 100, denominator)).toThrow(
      "Scale denominator must be positive",
    );
  });

  it("rejects an unsafe intermediate calculation", () => {
    expect(() => scaleQuantity(Number.MAX_SAFE_INTEGER, 2, 1)).toThrow(
      "Quantity calculation exceeds the supported range",
    );
  });
});
