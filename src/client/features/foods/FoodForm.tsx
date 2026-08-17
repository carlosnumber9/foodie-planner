import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { foodCategories, type FoodCategory } from "../../../domain/food";
import { measurementTypes, type MeasurementType, type MeasurementUnit } from "../../../domain/measurement";
import { useDraftState } from "../../draft-state";

const decimalField = z
  .string()
  .min(1, "Indica un valor.")
  .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, "Usa un número igual o mayor que cero.")
  .transform(Number);

const foodFormSchema = z.object({
  name: z.string().trim().min(1, "Escribe un nombre.").max(120, "El nombre es demasiado largo."),
  measurementType: z.enum(measurementTypes),
  defaultUnitId: z.string().min(1, "Selecciona una unidad."),
  category: z.enum(foodCategories),
  iconKey: z.null(),
  nutrition: z.object({
    energy: decimalField,
    protein: decimalField,
    carbohydrates: decimalField,
    fat: decimalField,
  }),
});

type FoodFormInput = z.input<typeof foodFormSchema>;
export type FoodFormValues = z.output<typeof foodFormSchema>;

interface FoodFormProps {
  mode: "create" | "edit";
  units: MeasurementUnit[];
  initialValues?: FoodFormValues;
  onSubmit(values: FoodFormValues): void | Promise<void>;
}

const measurementTypeLabels: Record<MeasurementType, string> = {
  mass: "Masa",
  volume: "Volumen",
  count: "Unidades",
};

const categoryLabels: Record<FoodCategory, string> = {
  fruit: "Fruta",
  vegetable: "Verdura",
  meat: "Carne",
  fish: "Pescado",
  cereal: "Cereal",
  dairy: "Lácteo",
  legume: "Legumbre",
  condiment: "Condimento",
  drink: "Bebida",
  prepared_food: "Comida preparada",
  generic_food: "Otro alimento",
};

const builtInUnitLabels: Record<string, string> = {
  gram: "Gramo",
  kilogram: "Kilogramo",
  millilitre: "Mililitro",
  litre: "Litro",
  unit: "Unidad",
};

function initialFormValues(values: FoodFormValues | undefined, units: MeasurementUnit[]): FoodFormInput {
  if (values !== undefined) {
    return {
      ...values,
      nutrition: {
        energy: String(values.nutrition.energy),
        protein: String(values.nutrition.protein),
        carbohydrates: String(values.nutrition.carbohydrates),
        fat: String(values.nutrition.fat),
      },
    };
  }

  return {
    name: "",
    measurementType: "mass",
    defaultUnitId: units.find((unit) => unit.measurementType === "mass" && unit.isActive)?.id ?? "",
    category: "generic_food",
    iconKey: null,
    nutrition: { energy: "", protein: "", carbohydrates: "", fat: "" },
  };
}

export function FoodForm({ mode, units, initialValues, onSubmit }: FoodFormProps) {
  const { setHasUnsavedChanges } = useDraftState();
  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    getValues,
    handleSubmit,
    register,
    setValue,
  } = useForm<FoodFormInput, unknown, FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: initialFormValues(initialValues, units),
  });
  const measurementType = useWatch({ control, name: "measurementType" });
  const compatibleUnits = units.filter(
    (unit) => unit.measurementType === measurementType && unit.isActive,
  );

  useEffect(() => {
    const selectedUnit = getValues("defaultUnitId");
    if (!compatibleUnits.some((unit) => unit.id === selectedUnit)) {
      setValue("defaultUnitId", compatibleUnits[0]?.id ?? "", { shouldValidate: true });
    }
  }, [compatibleUnits, getValues, setValue]);

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
    return () => setHasUnsavedChanges(false);
  }, [isDirty, setHasUnsavedChanges]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form className="space-y-6" onSubmit={(event) => void submit(event)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field sm:col-span-2">
          <span>Nombre</span>
          <input {...register("name")} autoComplete="off" />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </label>

        <label className="field">
          <span>Magnitud</span>
          <select {...register("measurementType")} disabled={mode === "edit"}>
            {measurementTypes.map((type) => (
              <option key={type} value={type}>
                {measurementTypeLabels[type]}
              </option>
            ))}
          </select>
          {mode === "edit" && (
            <span className="field-help">La magnitud no se puede cambiar después de crear el alimento.</span>
          )}
        </label>

        <label className="field">
          <span>Unidad predeterminada</span>
          <select {...register("defaultUnitId")}>
            {compatibleUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {builtInUnitLabels[unit.id] ?? unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
          {errors.defaultUnitId && <span className="field-error">{errors.defaultUnitId.message}</span>}
        </label>

        <label className="field sm:col-span-2">
          <span>Categoría</span>
          <select {...register("category")}>
            {foodCategories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="font-semibold">Nutrición</legend>
        <p className="field-help mb-3">
          Por 100 g para masa, por 100 ml para volumen y por unidad para unidades.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["energy", "Energía"],
              ["protein", "Proteínas"],
              ["carbohydrates", "Hidratos de carbono"],
              ["fat", "Grasas"],
            ] as const
          ).map(([field, label]) => (
            <label className="field" key={field}>
              <span>{label}</span>
              <input {...register(`nutrition.${field}`)} inputMode="decimal" type="number" min="0" step="0.01" />
              {errors.nutrition?.[field] && (
                <span className="field-error">{errors.nutrition[field]?.message}</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Guardar alimento"}
      </button>
    </form>
  );
}
