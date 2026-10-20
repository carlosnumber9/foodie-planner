import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import units from "../data/catalog/units.json";
import { canonicalJson } from "../src/catalog/catalog";
import { fixture } from "../tests/fixtures/catalog";
import { loadCatalogFiles } from "./catalog-files";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "foodie-catalog-"));
  mkdirSync(join(root, "data/catalog/foods"), { recursive: true });
  mkdirSync(join(root, "data/catalog/recipes"), { recursive: true });
  writeFileSync(join(root, "data/catalog/units.json"), canonicalJson(units));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("catalog build validation", () => {
  it("loads empty production directories", () => {
    expect(loadCatalogFiles(root).foods).toEqual([]);
  });
  it("loads accepted canonical files and their exact references", () => {
    const data = fixture();
    writeFileSync(
      join(root, "data/catalog/foods/test-food.json"),
      canonicalJson(data.foods[0]),
    );
    writeFileSync(
      join(root, "data/catalog/recipes/test-recipe.json"),
      canonicalJson(data.recipes[0]),
    );
    expect(
      loadCatalogFiles(root).recipes[0].revisions[0].ingredients[0]
        .foodRevision,
    ).toBe(1);
  });
  it("rejects a filename that disagrees with its stable identifier", () => {
    writeFileSync(
      join(root, "data/catalog/foods/wrong.json"),
      canonicalJson(fixture().foods[0]),
    );
    expect(() => loadCatalogFiles(root)).toThrow("filename must match");
  });
  it("rejects inconsistent formatting before bundling", () => {
    writeFileSync(
      join(root, "data/catalog/foods/test-food.json"),
      JSON.stringify(fixture().foods[0]),
    );
    expect(() => loadCatalogFiles(root)).toThrow("Non-canonical JSON");
  });
});
