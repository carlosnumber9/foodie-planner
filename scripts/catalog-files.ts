import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  assertCatalogEvolution,
  canonicalJson,
  parseCatalog,
  type Catalog,
} from "../src/catalog/catalog";

function readJson(path: string): unknown {
  const content = readFileSync(path, "utf8");
  const value: unknown = JSON.parse(content);
  if (content !== canonicalJson(value))
    throw new Error(
      `Non-canonical JSON; sort object keys and use two spaces: ${path}`,
    );
  return value;
}

export function loadCatalogFiles(root = process.cwd()): Catalog {
  const directory = resolve(root, "data/catalog");
  function documents(kind: string): unknown[] {
    return readdirSync(resolve(directory, kind))
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => {
        const value = readJson(resolve(directory, kind, name));
        if (
          typeof value !== "object" ||
          value === null ||
          !("id" in value) ||
          `${String(value.id)}.json` !== name
        ) {
          throw new Error(
            `Catalog filename must match its identifier: ${kind}/${name}`,
          );
        }
        return value;
      });
  }
  const catalog = parseCatalog({
    units: readJson(resolve(directory, "units.json")),
    foods: documents("foods"),
    recipes: documents("recipes"),
  });
  if (
    catalog.units.some(
      (unit, index) =>
        index > 0 &&
        catalog.units[index - 1].id.localeCompare(unit.id, "en") >= 0,
    )
  )
    throw new Error("Catalog units must be sorted by identifier");
  // Compare the working tree and the last committed change when Git history is available.
  for (const ref of ["HEAD", "HEAD^"]) {
    let files: string[];
    try {
      files = execFileSync(
        "git",
        ["ls-tree", "-r", "--name-only", ref, "data/catalog"],
        { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      )
        .trim()
        .split("\n")
        .filter(Boolean);
    } catch {
      continue;
    }
    if (!files.includes("data/catalog/units.json")) continue;
    const read = (name: string): unknown =>
      JSON.parse(
        execFileSync("git", ["show", `${ref}:${name}`], {
          cwd: root,
          encoding: "utf8",
        }),
      );
    assertCatalogEvolution(
      parseCatalog({
        units: read("data/catalog/units.json"),
        foods: files
          .filter((file) => /^data\/catalog\/foods\/.*\.json$/.test(file))
          .map(read),
        recipes: files
          .filter((file) => /^data\/catalog\/recipes\/.*\.json$/.test(file))
          .map(read),
      }),
      catalog,
    );
  }
  return catalog;
}
