import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import type { CreatePersonalFoodInput } from "../../application/food-service";
import { foodCategories } from "../../domain/food";
import { measurementTypes } from "../../domain/measurement";
import { apiRequest } from "./http";

const foodViewSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    measurementType: z.enum(measurementTypes),
    defaultUnitId: z.string().min(1),
    category: z.enum(foodCategories),
    iconKey: z.string().nullable(),
    nutrition: z.object({
      energy: z.number().finite().nonnegative(),
      protein: z.number().finite().nonnegative(),
      carbohydrates: z.number().finite().nonnegative(),
      fat: z.number().finite().nonnegative(),
    }),
    source: z.enum(["ciqual", "personal"]),
    sourceIdentifier: z.string().nullable(),
    sourceVersion: z.string().nullable(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
  })
  .strict();

function apiDataSchema<T extends z.ZodType>(data: T) {
  return z.object({ data, request_id: z.string().min(1) }).strict();
}

const foodsResponseSchema = apiDataSchema(z.array(foodViewSchema));
const foodResponseSchema = apiDataSchema(foodViewSchema);

export const foodsQuery = queryOptions({
  queryKey: ["foods"],
  queryFn: async () => (await apiRequest("/api/foods", foodsResponseSchema)).data,
});

export function useCreateFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (food: CreatePersonalFoodInput) =>
      (
        await apiRequest("/api/foods", foodResponseSchema, {
          method: "POST",
          body: JSON.stringify(food),
        })
      ).data,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: foodsQuery.queryKey }),
  });
}
