import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import units from "../../../data/catalog/units.json";
import type { MeasurementUnit } from "../../domain/measurement";
import {
  createLocalRepository,
  openLocalDatabase,
  writeTransaction,
} from "./local-repository";

const catalogUnits = units as MeasurementUnit[];
const unit: MeasurementUnit = {
  id: "personal-spoon",
  code: "spoon",
  symbol: "cda",
  name: "Cucharada",
  measurementType: "volume",
  baseAmountPerUnit: 1500,
  isBuiltIn: false,
  isActive: true,
};
let database: IDBDatabase;
beforeEach(async () => {
  vi.stubGlobal("indexedDB", new IDBFactory());
  database = await openLocalDatabase();
});
afterEach(() => {
  database.close();
  vi.unstubAllGlobals();
});

describe("local persistence", () => {
  it("retains settings, personal units and overrides after reopening", async () => {
    let repository = createLocalRepository(database, catalogUnits);
    await repository.saveSettings({ timeZone: "Europe/Madrid" });
    await repository.create(unit);
    await repository.setActive("gram", false);
    repository.close();
    database = await openLocalDatabase();
    repository = createLocalRepository(database, catalogUnits);
    const saved = await repository.load();
    expect(saved.settings.timeZone).toBe("Europe/Madrid");
    expect(saved.units.find((entry) => entry.id === unit.id)).toEqual(unit);
    expect(saved.units.find((entry) => entry.id === "gram")?.isActive).toBe(
      false,
    );
    expect(catalogUnits.find((entry) => entry.id === "gram")?.isActive).toBe(
      true,
    );
  });
  it("aborts every write when a later request fails", async () => {
    const repository = createLocalRepository(database, catalogUnits);
    await repository.saveSettings({ timeZone: "Europe/Madrid" });
    await repository.create(unit);
    await expect(
      writeTransaction(
        database,
        ["settings", "personalUnits"],
        (transaction) => {
          transaction
            .objectStore("settings")
            .put({
              id: "preferences",
              value: { timeZone: "America/New_York" },
            });
          transaction.objectStore("personalUnits").add(unit);
        },
      ),
    ).rejects.toMatchObject({ code: "write" });
    expect((await repository.load()).settings.timeZone).toBe("Europe/Madrid");
  });
  it("rejects invalid inputs without replacing saved settings", async () => {
    const repository = createLocalRepository(database, catalogUnits);
    await repository.saveSettings({ timeZone: "Europe/Madrid" });
    await expect(
      repository.saveSettings({ timeZone: "Invalid/Zone" }),
    ).rejects.toThrow();
    await expect(
      repository.create({ ...unit, baseAmountPerUnit: 0 }),
    ).rejects.toThrow();
    await expect(repository.create({ ...unit, code: "g" })).rejects.toThrow();
    await expect(repository.setActive("missing", true)).rejects.toMatchObject({
      code: "write",
    });
    expect((await repository.load()).settings.timeZone).toBe("Europe/Madrid");
  });
  it("enforces personal code uniqueness and rolls back accompanying writes", async () => {
    const repository = createLocalRepository(database, catalogUnits);
    await repository.create(unit);
    await expect(
      repository.create({ ...unit, id: "personal-other" }),
    ).rejects.toMatchObject({ code: "write" });
    expect(
      (await repository.load()).units.filter((entry) => !entry.isBuiltIn),
    ).toHaveLength(1);
  });
  it("reports unavailable storage rather than pretending a save succeeded", async () => {
    database.close();
    await expect(
      createLocalRepository(database, catalogUnits).saveSettings({
        timeZone: "UTC",
      }),
    ).rejects.toMatchObject({ code: "write" });
    vi.stubGlobal("indexedDB", undefined);
    await expect(openLocalDatabase()).rejects.toMatchObject({
      code: "unavailable",
    });
  });
  it("preserves local settings when the catalog is replaced", async () => {
    await createLocalRepository(database, catalogUnits).saveSettings({
      timeZone: "UTC",
    });
    const changed = catalogUnits.map((entry) => ({ ...entry }));
    expect(
      (await createLocalRepository(database, changed).load()).settings.timeZone,
    ).toBe("UTC");
  });
  it("reports corrupt data without deleting the database", async () => {
    await writeTransaction(database, ["settings"], (transaction) =>
      transaction
        .objectStore("settings")
        .put({ id: "preferences", value: { timeZone: "Invalid/Zone" } }),
    );
    await expect(
      createLocalRepository(database, catalogUnits).load(),
    ).rejects.toMatchObject({ code: "read" });
    expect(database.objectStoreNames.contains("settings")).toBe(true);
  });
});
