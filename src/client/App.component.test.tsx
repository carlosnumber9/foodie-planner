// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { AppRoutes } from "./App";

describe("application routes", () => {
  it("starts with recipes and exposes the agreed destinations", () => {
    render(
      <MemoryRouter initialEntries={["/recipes"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Recetas" })).toBeVisible();
    expect(screen.getAllByRole("navigation", { name: "Navegación principal" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Calendario" })[0]).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Inventario" })[0]).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Compra" })[0]).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Más" })[0]).toBeVisible();
  });

  it("navigates to settings through More", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/recipes"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    await user.click(screen.getAllByRole("link", { name: "Más" })[0]);
    await user.click(screen.getByRole("link", { name: "Ajustes" }));

    expect(screen.getByRole("heading", { name: "Ajustes" })).toBeVisible();
  });
});
