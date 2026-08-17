import type { MeasurementType, MeasurementUnit } from "../domain/measurement";
import { toScaledQuantity } from "../domain/quantity";
import { ApplicationError } from "./errors";

export interface MeasurementUnitRepository {
  list(): Promise<MeasurementUnit[]>;
  findById(id: string): Promise<MeasurementUnit | null>;
  create(unit: MeasurementUnit): Promise<MeasurementUnit>;
  setActive(id: string, active: boolean): Promise<void>;
}
export interface CreateMeasurementUnitInput {
  code: string;
  symbol: string;
  name: string;
  measurementType: MeasurementType;
  baseAmountPerUnit: number;
}

interface MeasurementUnitServiceDependencies {
  createId(): string;
}

export function createMeasurementUnitService(
  repository: MeasurementUnitRepository,
  dependencies: MeasurementUnitServiceDependencies,
) {
  return {
    list: () => repository.list(),

    async create(input: CreateMeasurementUnitInput): Promise<MeasurementUnit> {
      const unit: MeasurementUnit = {
        id: dependencies.createId(),
        code: input.code,
        symbol: input.symbol,
        name: input.name,
        measurementType: input.measurementType,
        baseAmountPerUnit: toScaledQuantity(input.baseAmountPerUnit),
        isBuiltIn: false,
        isActive: true,
      };

      return repository.create(unit);
    },

    async setActive(id: string, active: boolean): Promise<void> {
      const unit = await repository.findById(id);
      if (unit === null) {
        throw new ApplicationError(
          "measurement_unit_not_found",
          "not_found",
          "Measurement unit was not found",
        );
      }

      await repository.setActive(id, active);
    },
  };
}
