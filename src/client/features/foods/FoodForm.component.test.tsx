// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { MeasurementUnit } from "../../../domain/measurement";
import { toScaledQuantity } from "../../../domain/quantity";
import { FoodForm } from "./FoodForm";

const units: MeasurementUnit[] = [
  {
    id: "gram",
    code: "g",
    symbol: "g",
    name: "Gram",
    measurementType: "mass",
    baseAmountPerUnit: toScaledQuantity(1),
    isBuiltIn: true,
    isActive: true,
  },
  {
    id: "unit",
    code: "unit",
    symbol: "ud",
    name: "Unit",
    measurementType: "count",
    baseAmountPerUnit: toScaledQuantity(1),
    isBuiltIn: true,
    isActive: true,
  },
];

describe("FoodForm", () => {
  it("submits valid personal food values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FoodForm mode="create" units={units} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nombre"), "Tomate");
    await user.selectOptions(screen.getByLabelText("Categoría"), "vegetable");
    await user.type(screen.getByLabelText("Energía"), "18");
    await user.type(screen.getByLabelText("Proteínas"), "0.9");
    await user.type(screen.getByLabelText("Hidratos de carbono"), "3.9");
    await user.type(screen.getByLabelText("Grasas"), "0.2");
    await user.click(screen.getByRole("button", { name: "Guardar alimento" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Tomate",
        measurementType: "mass",
        defaultUnitId: "gram",
        category: "vegetable",
        nutrition: { energy: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2 },
      }),
    );
  });

  it("shows Spanish validation feedback", async () => {
    const user = userEvent.setup();
    render(<FoodForm mode="create" units={units} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Guardar alimento" }));

    expect(await screen.findByText("Escribe un nombre.")).toBeInTheDocument();
  });

  it("keeps magnitude disabled while editing", () => {
    render(
      <FoodForm
        mode="edit"
        units={units}
        onSubmit={vi.fn()}
        initialValues={{
          name: "Tomate",
          measurementType: "mass",
          defaultUnitId: "gram",
          category: "vegetable",
          iconKey: null,
          nutrition: { energy: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2 },
        }}
      />,
    );

    expect(screen.getByRole("combobox", { name: /Magnitud/ })).toBeDisabled();
    expect(screen.getByText("La magnitud no se puede cambiar después de crear el alimento.")).toBeVisible();
  });
});
