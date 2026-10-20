import { describe, expect, it } from "vitest";

import units from "../../data/catalog/units.json";
import {
  assertCatalogEvolution,
  calculateRecipeNutrition,
  canonicalJson,
  parseCatalog,
  resolveRecipe,
} from "./catalog";

import { fixture } from "../../tests/fixtures/catalog";

describe("catalog", () => {
  it("accepts an empty catalog with built-in units", () => {
    expect(parseCatalog({ units, foods: [], recipes: [] }).recipes).toEqual([]);
  });
  it("calculates nutrition using scaled amounts per serving", () => {
    const catalog = parseCatalog(fixture());
    expect(
      calculateRecipeNutrition(catalog, catalog.recipes[0].revisions[0]),
    ).toEqual({ energy: 10000, protein: 500, carbohydrates: 1000, fat: 500 });
  });
  it.each([
    [
      "duplicate identifiers",
      (input: ReturnType<typeof fixture>) => {
        input.foods.push(structuredClone(input.foods[0]));
      },
    ],
    [
      "missing food revision",
      (input: ReturnType<typeof fixture>) => {
        input.recipes[0].revisions[0].ingredients[0].foodRevision = 2;
      },
    ],
    [
      "incompatible recipe unit",
      (input: ReturnType<typeof fixture>) => {
        input.recipes[0].revisions[0].ingredients[0].unitId = "litre";
      },
    ],
    [
      "incompatible food unit",
      (input: ReturnType<typeof fixture>) => {
        input.foods[0].revisions[0].defaultUnitId = "unit";
      },
    ],
    [
      "fractional scaled quantity",
      (input: ReturnType<typeof fixture>) => {
        input.recipes[0].revisions[0].ingredients[0].amountPerServing = 0.5;
      },
    ],
    [
      "empty provenance",
      (input: ReturnType<typeof fixture>) => {
        input.foods[0].revisions[0].source.reference = "";
      },
    ],
    [
      "missing revision sequence",
      (input: ReturnType<typeof fixture>) => {
        input.foods[0].revisions[0].revision = 2;
      },
    ],
    [
      "changing measurement type",
      (input: ReturnType<typeof fixture>) => {
        input.foods[0].revisions.push({
          ...input.foods[0].revisions[0],
          revision: 2,
          measurementType: "count",
          defaultUnitId: "unit",
        });
      },
    ],
  ])("rejects %s", (_name, change) => {
    const input = fixture();
    change(input);
    expect(() => parseCatalog(input)).toThrow();
  });
  it("preserves old references when new revisions are appended or recipes archived", () => {
    const previous = parseCatalog(fixture());
    const next = structuredClone(previous);
    next.foods[0].revisions.push({
      ...next.foods[0].revisions[0],
      revision: 2,
      nutrition: { energy: 90000, protein: 0, carbohydrates: 0, fat: 0 },
    });
    next.recipes[0].revisions.push({
      ...next.recipes[0].revisions[0],
      revision: 2,
      name: "Nueva receta",
      ingredients: [
        { ...next.recipes[0].revisions[0].ingredients[0], foodRevision: 2 },
      ],
    });
    next.recipes[0].archived = true;
    const catalog = parseCatalog(next);
    expect(() => assertCatalogEvolution(previous, catalog)).not.toThrow();
    expect(
      calculateRecipeNutrition(
        catalog,
        resolveRecipe(catalog, { id: "test-recipe", revision: 1 }),
      ).energy,
    ).toBe(10000);
    expect(
      calculateRecipeNutrition(
        catalog,
        resolveRecipe(catalog, { id: "test-recipe", revision: 2 }),
      ).energy,
    ).toBe(45000);
  });
  it.each(["edit", "remove", "unit"])(
    "rejects destructive evolution: %s",
    (change) => {
      const previous = parseCatalog(fixture());
      const next = structuredClone(previous);
      if (change === "edit") next.foods[0].revisions[0].nutrition.energy = 1;
      if (change === "remove") next.recipes = [];
      if (change === "unit") next.units[0].baseAmountPerUnit = 300;
      expect(() => assertCatalogEvolution(previous, next)).toThrow();
    },
  );
  it("sorts object keys without reordering method steps", () => {
    expect(canonicalJson({ z: ["second", "first"], a: { z: 1, a: 2 } })).toBe(
      '{\n  "a": {\n    "a": 2,\n    "z": 1\n  },\n  "z": [\n    "second",\n    "first"\n  ]\n}\n',
    );
  });
});
