import { loadCatalogFiles } from "./catalog-files";

const catalog = loadCatalogFiles();
console.log(
  `Catalog valid: ${catalog.foods.length} foods, ${catalog.recipes.length} recipes, ${catalog.units.length} units.`,
);
