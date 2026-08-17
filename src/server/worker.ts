import { drizzle } from "drizzle-orm/d1";

import { ApplicationError } from "../application/errors";
import { createFoodService, type FoodRepository } from "../application/food-service";
import {
  createMeasurementUnitService,
  type MeasurementUnitRepository,
} from "../application/measurement-unit-service";
import { createAccessIdentityVerifier, type AccessIdentityEnvironment } from "./access-identity";
import { createApp } from "./app";
import { consoleLogger } from "./logging";
import { createRepositories } from "./persistence/repositories";
import * as schema from "./persistence/schema";

interface Bindings extends AccessIdentityEnvironment {
  DB?: D1Database;
}

function unavailablePersistence(): {
  foods: FoodRepository;
  measurementUnits: MeasurementUnitRepository;
} {
  const unavailable = () =>
    Promise.reject(
      new ApplicationError(
        "d1_binding_unavailable",
        "unavailable",
        "The D1 binding is not configured",
      ),
    );

  return {
    foods: {
      list: unavailable,
      findById: unavailable,
      create: unavailable,
      update: unavailable,
    },
    measurementUnits: {
      list: unavailable,
      findById: unavailable,
      create: unavailable,
      setActive: unavailable,
    },
  };
}

export default {
  fetch(request, environment) {
    const repositories =
      environment.DB === undefined
        ? unavailablePersistence()
        : createRepositories(drizzle(environment.DB, { schema }));
    const app = createApp({
      foodService: createFoodService(repositories.foods, repositories.measurementUnits, {
        createId: () => crypto.randomUUID(),
        now: () => Date.now(),
      }),
      measurementUnitService: createMeasurementUnitService(repositories.measurementUnits, {
        createId: () => crypto.randomUUID(),
      }),
      identityVerifier: createAccessIdentityVerifier(environment),
      logger: consoleLogger,
      createRequestId: () => crypto.randomUUID(),
      now: () => Date.now(),
    });

    return app.fetch(request);
  },
} satisfies ExportedHandler<Bindings>;
