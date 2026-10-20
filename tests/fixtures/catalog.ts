import units from "../../data/catalog/units.json";

// Synthetic fixture only; these nutrition values never enter the production catalog.
export function fixture() {
  return {
    units: structuredClone(units),
    foods: [
      {
        id: "test-food",
        revisions: [
          {
            revision: 1,
            name: "Alimento de prueba",
            measurementType: "mass",
            defaultUnitId: "gram",
            category: "generic_food",
            iconKey: null,
            nutrition: {
              energy: 20000,
              protein: 1000,
              carbohydrates: 2000,
              fat: 1000,
            },
            source: {
              type: "personal",
              reference: "Synthetic test label",
              version: "test-only",
              attribution: "Test fixture",
            },
          },
        ],
      },
    ],
    recipes: [
      {
        id: "test-recipe",
        archived: false,
        revisions: [
          {
            revision: 1,
            name: "Receta de prueba",
            ingredients: [
              {
                foodId: "test-food",
                foodRevision: 1,
                amountPerServing: 5000,
                unitId: "gram",
              },
            ],
            steps: ["Paso uno", "Paso dos"],
            tags: ["Prueba"],
            preparationTime: null,
            cookingTime: 10,
            note: null,
          },
        ],
      },
    ],
  };
}
