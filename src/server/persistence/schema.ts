import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { foodCategories } from "../../domain/food";
import { measurementTypes } from "../../domain/measurement";

export const measurementUnits = sqliteTable(
  "measurement_units",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    symbol: text("symbol").notNull(),
    name: text("name").notNull(),
    measurementType: text("measurement_type", { enum: measurementTypes }).notNull(),
    baseAmountPerUnit: integer("base_amount_per_unit").notNull(),
    isBuiltIn: integer("is_built_in", { mode: "boolean" }).notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull(),
  },
  (table) => [
    uniqueIndex("measurement_units_id_type_unique").on(table.id, table.measurementType),
    index("measurement_units_type_active_index").on(table.measurementType, table.isActive),
    check(
      "measurement_units_type_check",
      sql`${table.measurementType} IN ('mass', 'volume', 'count')`,
    ),
    check("measurement_units_base_amount_positive", sql`${table.baseAmountPerUnit} > 0`),
    check("measurement_units_built_in_boolean", sql`${table.isBuiltIn} IN (0, 1)`),
    check("measurement_units_active_boolean", sql`${table.isActive} IN (0, 1)`),
  ],
);

export const foods = sqliteTable(
  "foods",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    measurementType: text("measurement_type", { enum: measurementTypes }).notNull(),
    defaultUnitId: text("default_unit_id").notNull(),
    category: text("category", { enum: foodCategories }).notNull(),
    iconKey: text("icon_key"),
    energy: integer("energy").notNull(),
    protein: integer("protein").notNull(),
    carbohydrates: integer("carbohydrates").notNull(),
    fat: integer("fat").notNull(),
    source: text("source", { enum: ["ciqual", "personal"] }).notNull(),
    sourceIdentifier: text("source_identifier"),
    sourceVersion: text("source_version"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.defaultUnitId, table.measurementType],
      foreignColumns: [measurementUnits.id, measurementUnits.measurementType],
      name: "foods_default_unit_type_fk",
    }),
    index("foods_name_index").on(table.name),
    index("foods_category_type_index").on(table.category, table.measurementType),
    check("foods_measurement_type_check", sql`${table.measurementType} IN ('mass', 'volume', 'count')`),
    check(
      "foods_category_check",
      sql`${table.category} IN ('fruit', 'vegetable', 'meat', 'fish', 'cereal', 'dairy', 'legume', 'condiment', 'drink', 'prepared_food', 'generic_food')`,
    ),
    check("foods_source_check", sql`${table.source} IN ('ciqual', 'personal')`),
    check("foods_energy_non_negative", sql`${table.energy} >= 0`),
    check("foods_protein_non_negative", sql`${table.protein} >= 0`),
    check("foods_carbohydrates_non_negative", sql`${table.carbohydrates} >= 0`),
    check("foods_fat_non_negative", sql`${table.fat} >= 0`),
    check(
      "foods_source_metadata_check",
      sql`(${table.source} = 'personal' AND ${table.sourceIdentifier} IS NULL AND ${table.sourceVersion} IS NULL) OR (${table.source} = 'ciqual' AND ${table.sourceIdentifier} IS NOT NULL AND ${table.sourceVersion} IS NOT NULL)`,
    ),
  ],
);

export type FoodRow = typeof foods.$inferSelect;
export type MeasurementUnitRow = typeof measurementUnits.$inferSelect;
