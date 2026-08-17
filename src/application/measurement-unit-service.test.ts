import { describe, expect, it, vi } from "vitest";

import type { MeasurementUnit } from "../domain/measurement";
import { createMeasurementUnitService, type MeasurementUnitRepository } from "./measurement-unit-service";

function createRepository(): MeasurementUnitRepository {
  return {
    list: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn(async (value: MeasurementUnit) => value),
    setActive: vi.fn(async () => undefined),
  };
}

describe("measurement unit service", () => {
  it("lists units from the repository", async () => {
    const repository = createRepository();
    vi.mocked(repository.list).mockResolvedValue([{
      id: "gram",
      code: "g",
      symbol: "g",
      name: "Gram",
      measurementType: "mass",
      baseAmountPerUnit: 100,
      isBuiltIn: true,
      isActive: true,
    }]);
    const service = createMeasurementUnitService(repository, { createId: () => "unused" });

    await expect(service.list()).resolves.toHaveLength(1);
  });

  it("creates a custom unit with a scaled base factor", async () => {
    const repository = createRepository();
    const service = createMeasurementUnitService(repository, { createId: () => "unit-1" });

    await expect(
      service.create({
        code: "tbsp",
        symbol: "cda",
        name: "Tablespoon",
        measurementType: "volume",
        baseAmountPerUnit: 15,
      }),
    ).resolves.toEqual({
      id: "unit-1",
      code: "tbsp",
      symbol: "cda",
      name: "Tablespoon",
      measurementType: "volume",
      baseAmountPerUnit: 1_500,
      isBuiltIn: false,
      isActive: true,
    });
  });

  it("activates or hides an existing unit", async () => {
    const repository = createRepository();
    vi.mocked(repository.findById).mockResolvedValue({
      id: "gram",
      code: "g",
      symbol: "g",
      name: "Gram",
      measurementType: "mass",
      baseAmountPerUnit: 100,
      isBuiltIn: true,
      isActive: true,
    });
    const service = createMeasurementUnitService(repository, { createId: () => "unused" });

    await service.setActive("gram", false);

    expect(repository.setActive).toHaveBeenCalledWith("gram", false);
  });

  it("reports a missing unit when changing activation", async () => {
    const repository = createRepository();
    const service = createMeasurementUnitService(repository, { createId: () => "unused" });

    await expect(service.setActive("missing", false)).rejects.toMatchObject({
      code: "measurement_unit_not_found",
      kind: "not_found",
      message: "Measurement unit was not found",
    });
    expect(repository.setActive).not.toHaveBeenCalled();
  });
});
