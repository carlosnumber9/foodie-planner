// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IDBFactory } from "fake-indexeddb";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fixture } from "../../tests/fixtures/catalog";
import { catalog } from "../catalog";
import { parseCatalog } from "../catalog/catalog";
import { AppRoutes } from "./App";

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}
afterEach(() => {
  vi.unstubAllGlobals();
  catalog.foods.length = 0;
  catalog.recipes.length = 0;
});

describe("static application", () => {
  it("opens recipes without authentication or an API request", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    renderApp("/recipes");
    expect(screen.getByRole("heading", { name: "Recetas" })).toBeVisible();
    expect(
      screen.getByText("Todavía no hay recetas en tu catálogo."),
    ).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
  });
  it("finds the read-only food catalog under More", async () => {
    renderApp("/more");
    await userEvent.click(screen.getByRole("link", { name: "Alimentos" }));
    expect(screen.getByRole("heading", { name: "Alimentos" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /crear/i }),
    ).not.toBeInTheDocument();
  });
  it("shows accepted recipes with pinned ingredients and calculated nutrition", async () => {
    const content = parseCatalog(fixture());
    catalog.foods.push(...content.foods);
    catalog.recipes.push(...content.recipes);
    renderApp("/recipes");
    expect(
      screen.getByRole("heading", { name: "Receta de prueba" }),
    ).toBeVisible();
    expect(screen.getByText("50 g de Alimento de prueba")).toBeVisible();
    expect(screen.getByText(/100 kcal por ración/)).toBeVisible();
    await userEvent.type(screen.getByRole("searchbox"), "missing");
    expect(
      screen.getByText("No hay resultados para esta búsqueda."),
    ).toBeVisible();
  });
  it("hides archived recipes from new selections", () => {
    const content = parseCatalog(fixture());
    content.recipes[0].archived = true;
    catalog.foods.push(...content.foods);
    catalog.recipes.push(...content.recipes);
    renderApp("/recipes");
    expect(
      screen.queryByRole("heading", { name: "Receta de prueba" }),
    ).not.toBeInTheDocument();
  });
  it("saves local preferences and shows storage errors", async () => {
    vi.stubGlobal("indexedDB", new IDBFactory());
    renderApp("/more/settings");
    const input = await screen.findByLabelText("Zona horaria");
    await userEvent.clear(input);
    await userEvent.type(input, "UTC");
    await userEvent.click(
      screen.getByRole("button", { name: "Guardar ajustes" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Cambio guardado",
    );
    await userEvent.clear(input);
    await userEvent.type(input, "Invalid/Zone");
    await userEvent.click(
      screen.getByRole("button", { name: "Guardar ajustes" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo guardar",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
