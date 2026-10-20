import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, NavLink, Outlet, Route, Routes } from "react-router";

import { catalog } from "../catalog";
import { calculateRecipeNutrition } from "../catalog/catalog";
import { fromScaledQuantity } from "../domain/quantity";
import { SettingsPage } from "./features/settings/SettingsPage";
import { animateEntrance } from "./motion";

const primaryDestinations = [
  { to: "/recipes", label: "Recetas", placeholder: "R" },
  { to: "/calendar", label: "Calendario", placeholder: "C" },
  { to: "/inventory", label: "Inventario", placeholder: "I" },
  { to: "/shopping", label: "Compra", placeholder: "C" },
  { to: "/more", label: "Más", placeholder: "M" },
] as const;

function PrimaryNavigation() {
  return (
    <nav aria-label="Navegación principal" className="primary-navigation">
      {primaryDestinations.map((destination) => (
        <NavLink
          className={({ isActive }) =>
            `navigation-link${isActive ? " navigation-link-active" : ""}`
          }
          key={destination.to}
          to={destination.to}
        >
          <span aria-hidden="true" className="semantic-icon-placeholder">
            {destination.placeholder}
          </span>
          <span>{destination.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <p className="brand">Foodie Planner</p>
        <PrimaryNavigation />
      </aside>
      <main className="main-content" id="main-content">
        <Outlet />
      </main>
      <div className="bottom-navigation">
        <PrimaryNavigation />
      </div>
    </div>
  );
}

function AnimatedSection({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  useEffect(
    () => (section.current ? animateEntrance(section.current) : undefined),
    [],
  );
  return (
    <section className="page-card" ref={section}>
      {children}
    </section>
  );
}

function PlaceholderPage({ title, detail }: { title: string; detail: string }) {
  return (
    <AnimatedSection>
      <p className="eyebrow">Próximamente</p>
      <h1>{title}</h1>
      <p>{detail}</p>
    </AnimatedSection>
  );
}

const numberFormat = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
});
const formatQuantity = (value: number) =>
  numberFormat.format(fromScaledQuantity(value));
const magnitudeLabels = { mass: "Masa", volume: "Volumen", count: "Cantidad" };
const categoryLabels = {
  fruit: "Fruta",
  vegetable: "Verdura",
  meat: "Carne",
  fish: "Pescado",
  cereal: "Cereal",
  dairy: "Lácteo",
  legume: "Legumbre",
  condiment: "Condimento",
  drink: "Bebida",
  prepared_food: "Preparado",
  generic_food: "Otro alimento",
};

function CatalogPage({ kind }: { kind: "foods" | "recipes" }) {
  const [search, setSearch] = useState("");
  const title = kind === "foods" ? "Alimentos" : "Recetas";
  const query = search.trim().toLocaleLowerCase("es");
  const foods = catalog.foods.filter((food) =>
    food.revisions.at(-1)!.name.toLocaleLowerCase("es").includes(query),
  );
  const recipes = catalog.recipes.filter(
    (recipe) =>
      !recipe.archived &&
      recipe.revisions.at(-1)!.name.toLocaleLowerCase("es").includes(query),
  );
  const count = kind === "foods" ? foods.length : recipes.length;
  return (
    <AnimatedSection>
      <p className="eyebrow">Tu catálogo</p>
      <h1>{title}</h1>
      <label className="field">
        Buscar {title.toLocaleLowerCase("es")}
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      {count === 0 && (
        <p>
          {catalog[kind].length === 0
            ? `Todavía no hay ${title.toLocaleLowerCase("es")} en tu catálogo.`
            : kind === "recipes" && !query
              ? "No hay recetas activas en tu catálogo."
              : "No hay resultados para esta búsqueda."}
        </p>
      )}
      <div className="catalog-list">
        {kind === "foods"
          ? foods.map((document) => {
              const food = document.revisions.at(-1)!;
              return (
                <article className="catalog-entry" key={document.id}>
                  <h2>{food.name}</h2>
                  <p>
                    {magnitudeLabels[food.measurementType]} ·{" "}
                    {categoryLabels[food.category]}
                  </p>
                  <p>
                    {formatQuantity(food.nutrition.energy)} kcal · Proteínas{" "}
                    {formatQuantity(food.nutrition.protein)} g · Hidratos{" "}
                    {formatQuantity(food.nutrition.carbohydrates)} g · Grasas{" "}
                    {formatQuantity(food.nutrition.fat)} g{" "}
                    {food.measurementType === "count"
                      ? "por unidad"
                      : food.measurementType === "mass"
                        ? "por 100 g"
                        : "por 100 ml"}
                  </p>
                  <p className="field-help">
                    Fuente: {food.source.reference} · {food.source.version}.{" "}
                    {food.source.attribution}
                  </p>
                </article>
              );
            })
          : recipes.map((document) => {
              const recipe = document.revisions.at(-1)!;
              const nutrition = calculateRecipeNutrition(catalog, recipe);
              return (
                <article className="catalog-entry" key={document.id}>
                  <h2>{recipe.name}</h2>
                  <p>{recipe.tags.join(" · ")}</p>
                  <p>
                    {formatQuantity(nutrition.energy)} kcal por ración ·
                    Proteínas {formatQuantity(nutrition.protein)} g · Hidratos{" "}
                    {formatQuantity(nutrition.carbohydrates)} g · Grasas{" "}
                    {formatQuantity(nutrition.fat)} g
                  </p>
                  <h3>Ingredientes por ración</h3>
                  <ul>
                    {recipe.ingredients.map((ingredient, index) => {
                      const food = catalog.foods.find(
                        (entry) => entry.id === ingredient.foodId,
                      )!.revisions[ingredient.foodRevision - 1];
                      const unit = catalog.units.find(
                        (entry) => entry.id === ingredient.unitId,
                      )!;
                      return (
                        <li key={index}>
                          {formatQuantity(ingredient.amountPerServing)}{" "}
                          {unit.symbol} de {food.name}
                        </li>
                      );
                    })}
                  </ul>
                  <h3>Preparación</h3>
                  <ol>
                    {recipe.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                  {recipe.preparationTime !== null && (
                    <p>Preparación: {recipe.preparationTime} min</p>
                  )}
                  {recipe.cookingTime !== null && (
                    <p>Cocción: {recipe.cookingTime} min</p>
                  )}
                  {recipe.note && <p>{recipe.note}</p>}
                </article>
              );
            })}
      </div>
    </AnimatedSection>
  );
}

function MorePage() {
  return (
    <AnimatedSection>
      <h1>Más</h1>
      <div className="stacked-links">
        <NavLink to="/more/foods">Alimentos</NavLink>
        <NavLink to="/more/history">Historial</NavLink>
        <NavLink to="/more/settings">Ajustes</NavLink>
      </div>
    </AnimatedSection>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/recipes" />} />
        <Route
          path="recipes"
          element={<CatalogPage key="recipes" kind="recipes" />}
        />
        <Route
          path="calendar"
          element={
            <PlaceholderPage
              title="Calendario"
              detail="Aquí podrás planificar tus comidas. La planificación será opcional."
            />
          }
        />
        <Route
          path="inventory"
          element={
            <PlaceholderPage
              title="Inventario"
              detail="Aquí verás los alimentos disponibles en casa."
            />
          }
        />
        <Route
          path="shopping"
          element={
            <PlaceholderPage
              title="Compra"
              detail="La lista de compra será siempre manual."
            />
          }
        />
        <Route path="more" element={<MorePage />} />
        <Route
          path="more/foods"
          element={<CatalogPage key="foods" kind="foods" />}
        />
        <Route
          path="more/history"
          element={
            <PlaceholderPage
              title="Historial"
              detail="Los eventos aparecerán en orden cronológico."
            />
          }
        />
        <Route path="more/settings" element={<SettingsPage />} />
        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Página no encontrada"
              detail="Esta dirección no existe."
            />
          }
        />
      </Route>
    </Routes>
  );
}
