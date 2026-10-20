import { z } from "zod";

import { measurementUnitSchema } from "../../catalog/catalog";
import type { MeasurementUnit } from "../../domain/measurement";

const DATABASE_NAME = "foodie-planner";
export const localStores = [
  "settings",
  "personalUnits",
  "unitPreferences",
] as const;
type LocalStore = (typeof localStores)[number];
export const settingsSchema = z.strictObject({
  timeZone: z
    .string()
    .min(1)
    .max(100)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("es-ES", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Invalid IANA time zone"),
});
export type Settings = z.infer<typeof settingsSchema>;
const personalUnitSchema = measurementUnitSchema.extend({
  id: z.string().regex(/^personal-[a-z0-9-]+$/),
  isBuiltIn: z.literal(false),
});
const unitPreferenceSchema = z.strictObject({
  id: z.string().min(1),
  isActive: z.boolean(),
});

export class LocalPersistenceError extends Error {
  constructor(
    public readonly code: "unavailable" | "blocked" | "read" | "write",
    cause?: unknown,
  ) {
    super(`Local storage ${code}`, { cause });
    this.name = "LocalPersistenceError";
  }
}

export function openLocalDatabase(name = DATABASE_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    let blocked = false;
    try {
      request = indexedDB.open(name, 1);
    } catch (error) {
      reject(new LocalPersistenceError("unavailable", error));
      return;
    }
    request.onupgradeneeded = () => {
      // Future upgrades add migrations here; never delete existing stores on startup.
      for (const store of localStores) {
        if (!request.result.objectStoreNames.contains(store))
          request.result.createObjectStore(store, { keyPath: "id" });
      }
    };
    request.onblocked = () => {
      blocked = true;
      reject(new LocalPersistenceError("blocked"));
    };
    request.onerror = () =>
      reject(new LocalPersistenceError("unavailable", request.error));
    request.onsuccess = () => {
      const database = request.result;
      if (blocked) {
        database.close();
        return;
      }
      database.onversionchange = () => database.close();
      resolve(database);
    };
  });
}

// Enqueue IDB requests synchronously: awaiting unrelated work can auto-commit a transaction.
export function writeTransaction(
  database: IDBDatabase,
  stores: LocalStore[],
  enqueue: (transaction: IDBTransaction) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = database.transaction(stores, "readwrite");
    } catch (error) {
      reject(new LocalPersistenceError("write", error));
      return;
    }
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(new LocalPersistenceError("write", transaction.error));
    try {
      enqueue(transaction);
    } catch (error) {
      transaction.abort();
      reject(new LocalPersistenceError("write", error));
    }
  });
}

export function createLocalRepository(
  database: IDBDatabase,
  catalogUnits: readonly MeasurementUnit[],
) {
  return {
    close: () => database.close(),
    async load(): Promise<{ settings: Settings; units: MeasurementUnit[] }> {
      const records = await new Promise<unknown[][]>((resolve, reject) => {
        let transaction: IDBTransaction;
        try {
          transaction = database.transaction([...localStores], "readonly");
        } catch (error) {
          reject(new LocalPersistenceError("read", error));
          return;
        }
        const requests = localStores.map(
          (store) =>
            transaction.objectStore(store).getAll() as IDBRequest<unknown[]>,
        );
        transaction.oncomplete = () =>
          resolve(requests.map((request) => request.result));
        transaction.onabort = () =>
          reject(new LocalPersistenceError("read", transaction.error));
      });
      try {
        const savedSettings = z
          .array(
            z.strictObject({
              id: z.literal("preferences"),
              value: settingsSchema,
            }),
          )
          .parse(records[0]);
        const personalUnits = z.array(personalUnitSchema).parse(records[1]);
        const preferences = z.array(unitPreferenceSchema).parse(records[2]);
        const allUnits = [...catalogUnits, ...personalUnits];
        if (new Set(allUnits.map((unit) => unit.code)).size !== allUnits.length)
          throw new Error("Duplicate unit code");
        return {
          settings: savedSettings[0]?.value ?? {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          units: allUnits.map((unit) => ({
            ...unit,
            isActive:
              preferences.find((preference) => preference.id === unit.id)
                ?.isActive ?? unit.isActive,
          })),
        };
      } catch (error) {
        throw new LocalPersistenceError("read", error);
      }
    },
    async saveSettings(input: Settings): Promise<void> {
      const value = settingsSchema.parse(input);
      await writeTransaction(database, ["settings"], (transaction) => {
        transaction.objectStore("settings").put({ id: "preferences", value });
      });
    },
    async create(unit: MeasurementUnit): Promise<MeasurementUnit> {
      const value = personalUnitSchema.parse(unit);
      if (catalogUnits.some((entry) => entry.code === value.code))
        throw new Error("Duplicate unit code");
      // Code uniqueness is checked inside this transaction so separate tabs cannot race.
      await new Promise<void>((resolve, reject) => {
        let transaction: IDBTransaction;
        try {
          transaction = database.transaction(
            ["personalUnits", "unitPreferences"],
            "readwrite",
          );
        } catch (error) {
          reject(new LocalPersistenceError("write", error));
          return;
        }
        transaction.oncomplete = () => resolve();
        transaction.onabort = () =>
          reject(new LocalPersistenceError("write", transaction.error));
        const request = transaction
          .objectStore("personalUnits")
          .getAll() as IDBRequest<MeasurementUnit[]>;
        request.onsuccess = () => {
          if (request.result.some((entry) => entry.code === value.code)) {
            transaction.abort();
            return;
          }
          transaction.objectStore("personalUnits").add(value);
          transaction
            .objectStore("unitPreferences")
            .add({ id: value.id, isActive: value.isActive });
        };
      });
      return value;
    },
    async setActive(id: string, isActive: boolean): Promise<void> {
      const value = unitPreferenceSchema.parse({ id, isActive });
      await writeTransaction(
        database,
        ["personalUnits", "unitPreferences"],
        (transaction) => {
          if (catalogUnits.some((unit) => unit.id === id)) {
            transaction.objectStore("unitPreferences").put(value);
            return;
          }
          const request = transaction.objectStore("personalUnits").get(id);
          request.onsuccess = () => {
            if (request.result === undefined) {
              transaction.abort();
              return;
            }
            transaction.objectStore("unitPreferences").put(value);
          };
        },
      );
    },
  };
}

export type LocalRepository = ReturnType<typeof createLocalRepository>;
