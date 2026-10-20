import units from "../../data/catalog/units.json";
import { parseCatalog } from "./catalog";

const foods = import.meta.glob("../../data/catalog/foods/*.json", {
  eager: true,
  import: "default",
});
const recipes = import.meta.glob("../../data/catalog/recipes/*.json", {
  eager: true,
  import: "default",
});

export const catalog = parseCatalog({
  units,
  foods: Object.entries(foods)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value),
  recipes: Object.entries(recipes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value),
});
