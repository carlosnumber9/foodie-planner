import { z } from "zod";

import { foodCategories } from "../domain/food";
import { measurementTypes } from "../domain/measurement";

const nutritionSchema = z
  .object({
    energy: z.number().finite().nonnegative(),
    protein: z.number().finite().nonnegative(),
    carbohydrates: z.number().finite().nonnegative(),
    fat: z.number().finite().nonnegative(),
  })
  .strict();

export const operationIdSchema = z.string().uuid();

export const resourceIdParamsSchema = z
  .object({ id: z.string().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/) })
  .strict();

export const createFoodRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    measurementType: z.enum(measurementTypes),
    defaultUnitId: z.string().min(1).max(80),
    category: z.enum(foodCategories),
    iconKey: z.string().trim().min(1).max(80).nullable().optional().default(null),
    nutrition: nutritionSchema,
  })
  .strict();

export const updateFoodRequestSchema = createFoodRequestSchema
  .omit({ iconKey: true })
  .partial()
  .extend({ iconKey: z.string().trim().min(1).max(80).nullable().optional() })
  .refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" });

export const createMeasurementUnitRequestSchema = z
  .object({
    code: z.string().trim().min(1).max(24),
    symbol: z.string().trim().min(1).max(16),
    name: z.string().trim().min(1).max(80),
    measurementType: z.enum(measurementTypes),
    baseAmountPerUnit: z.number().finite().positive(),
  })
  .strict();

export const setMeasurementUnitActiveRequestSchema = z
  .object({ active: z.boolean() })
  .strict();

export const clientErrorReportSchema = z
  .object({
    applicationVersion: z.string().trim().min(1).max(64),
    route: z.string().regex(/^\/[A-Za-z0-9_./:-]*$/).max(300),
    location: z.string().max(500).optional(),
    stack: z.string().max(8_000).optional(),
  })
  .strict();
