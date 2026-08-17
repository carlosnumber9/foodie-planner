CREATE TABLE `foods` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`measurement_type` text NOT NULL,
	`default_unit_id` text NOT NULL,
	`category` text NOT NULL,
	`icon_key` text,
	`energy` integer NOT NULL,
	`protein` integer NOT NULL,
	`carbohydrates` integer NOT NULL,
	`fat` integer NOT NULL,
	`source` text NOT NULL,
	`source_identifier` text,
	`source_version` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`default_unit_id`,`measurement_type`) REFERENCES `measurement_units`(`id`,`measurement_type`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "foods_measurement_type_check" CHECK("foods"."measurement_type" IN ('mass', 'volume', 'count')),
	CONSTRAINT "foods_category_check" CHECK("foods"."category" IN ('fruit', 'vegetable', 'meat', 'fish', 'cereal', 'dairy', 'legume', 'condiment', 'drink', 'prepared_food', 'generic_food')),
	CONSTRAINT "foods_source_check" CHECK("foods"."source" IN ('ciqual', 'personal')),
	CONSTRAINT "foods_energy_non_negative" CHECK("foods"."energy" >= 0),
	CONSTRAINT "foods_protein_non_negative" CHECK("foods"."protein" >= 0),
	CONSTRAINT "foods_carbohydrates_non_negative" CHECK("foods"."carbohydrates" >= 0),
	CONSTRAINT "foods_fat_non_negative" CHECK("foods"."fat" >= 0),
	CONSTRAINT "foods_source_metadata_check" CHECK(("foods"."source" = 'personal' AND "foods"."source_identifier" IS NULL AND "foods"."source_version" IS NULL) OR ("foods"."source" = 'ciqual' AND "foods"."source_identifier" IS NOT NULL AND "foods"."source_version" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `foods_name_index` ON `foods` (`name`);--> statement-breakpoint
CREATE INDEX `foods_category_type_index` ON `foods` (`category`,`measurement_type`);--> statement-breakpoint
CREATE TABLE `measurement_units` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`measurement_type` text NOT NULL,
	`base_amount_per_unit` integer NOT NULL,
	`is_built_in` integer NOT NULL,
	`is_active` integer NOT NULL,
	CONSTRAINT "measurement_units_type_check" CHECK("measurement_units"."measurement_type" IN ('mass', 'volume', 'count')),
	CONSTRAINT "measurement_units_base_amount_positive" CHECK("measurement_units"."base_amount_per_unit" > 0),
	CONSTRAINT "measurement_units_built_in_boolean" CHECK("measurement_units"."is_built_in" IN (0, 1)),
	CONSTRAINT "measurement_units_active_boolean" CHECK("measurement_units"."is_active" IN (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `measurement_units_id_type_unique` ON `measurement_units` (`id`,`measurement_type`);--> statement-breakpoint
CREATE INDEX `measurement_units_type_active_index` ON `measurement_units` (`measurement_type`,`is_active`);--> statement-breakpoint
INSERT INTO `measurement_units` (`id`, `code`, `symbol`, `name`, `measurement_type`, `base_amount_per_unit`, `is_built_in`, `is_active`) VALUES
	('gram', 'g', 'g', 'Gram', 'mass', 100, 1, 1),
	('kilogram', 'kg', 'kg', 'Kilogram', 'mass', 100000, 1, 1),
	('millilitre', 'ml', 'ml', 'Millilitre', 'volume', 100, 1, 1),
	('litre', 'l', 'l', 'Litre', 'volume', 100000, 1, 1),
	('unit', 'unit', 'ud', 'Unit', 'count', 100, 1, 1);
