import { Hono, type Context, type Input } from "hono";

import { ApplicationError } from "../application/errors";
import type { createFoodService } from "../application/food-service";
import type { createMeasurementUnitService } from "../application/measurement-unit-service";
import type { Food } from "../domain/food";
import type { MeasurementUnit } from "../domain/measurement";
import { fromScaledQuantity } from "../domain/quantity";
import {
  createFoodRequestSchema,
  clientErrorReportSchema,
  createMeasurementUnitRequestSchema,
  operationIdSchema,
  resourceIdParamsSchema,
  setMeasurementUnitActiveRequestSchema,
  updateFoodRequestSchema,
} from "../shared/api-schemas";
import type { Logger } from "./logging";
import { scrubClientLocation, scrubClientStack, scrubErrorStack } from "./logging";
import { problemResponse, zodIssuesToFieldProblems, type ProblemInput } from "./problem";

interface VerifiedIdentity {
  subject: string;
}

export interface IdentityVerifier {
  verify(request: Request): Promise<VerifiedIdentity | null>;
}

interface AppVariables {
  errorCode: string | null;
  requestId: string;
  operationId: string | null;
  identitySubject: string;
}

interface AppEnvironment {
  Variables: AppVariables;
}

export interface AppDependencies {
  foodService: ReturnType<typeof createFoodService>;
  measurementUnitService: ReturnType<typeof createMeasurementUnitService>;
  identityVerifier: IdentityVerifier;
  logger: Logger;
  createRequestId(): string;
  now(): number;
}

const commandMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function logCompletion(
  logger: Logger,
  status: number,
  entry: Parameters<Logger["info"]>[0],
): void {
  (status >= 500 ? logger.error : status >= 400 ? logger.warn : logger.info)(entry);
}

function respondWithProblem<Path extends string, RouteInput extends Input>(
  context: Context<AppEnvironment, Path, RouteInput>,
  input: ProblemInput,
): Response {
  context.set("errorCode", input.code);
  return problemResponse(context.get("requestId"), input);
}

function foodView(food: Food) {
  return {
    ...food,
    nutrition: {
      energy: fromScaledQuantity(food.nutrition.energy),
      protein: fromScaledQuantity(food.nutrition.protein),
      carbohydrates: fromScaledQuantity(food.nutrition.carbohydrates),
      fat: fromScaledQuantity(food.nutrition.fat),
    },
  };
}

function measurementUnitView(unit: MeasurementUnit) {
  return {
    ...unit,
    baseAmountPerUnit: fromScaledQuantity(unit.baseAmountPerUnit),
  };
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export function createApp(dependencies: AppDependencies): Hono<AppEnvironment> {
  const app = new Hono<AppEnvironment>();

  app.use("/api/*", async (c, next) => {
    const requestId = dependencies.createRequestId();
    const route = new URL(c.req.url).pathname;
    const startedAt = dependencies.now();
    c.set("requestId", requestId);
    c.set("operationId", null);
    c.set("errorCode", null);
    c.header("x-request-id", requestId);

    await next();

    const status = c.res.status;
    const entry = {
      event: "request.completed",
      outcome: status < 400 ? "success" : "failure",
      request_id: requestId,
      operation_id: c.get("operationId"),
      route,
      duration_ms: Math.max(0, dependencies.now() - startedAt),
      status,
      error_code: c.get("errorCode") ?? undefined,
    } as const;
    logCompletion(dependencies.logger, status, entry);

    if (commandMethods.has(c.req.method)) {
      const commandEntry = { ...entry, event: "command.completed" };
      logCompletion(dependencies.logger, status, commandEntry);
    }
  });

  app.use("/api/*", async (c, next) => {
    const identity = await dependencies.identityVerifier.verify(c.req.raw);
    if (identity === null) {
      return respondWithProblem(c, {
        status: 401,
        title: "Authentication required",
        detail: "A valid Cloudflare Access identity is required",
        code: "access_identity_required",
      });
    }
    c.set("identitySubject", identity.subject);
    await next();
  });

  app.use("/api/*", async (c, next) => {
    if (!commandMethods.has(c.req.method)) {
      await next();
      return;
    }

    const result = operationIdSchema.safeParse(c.req.header("x-operation-id"));
    if (!result.success) {
      return respondWithProblem(c, {
        status: 400,
        title: "Operation identifier required",
        detail: "Commands require a valid X-Operation-Id header",
        code: "operation_id_required",
      });
    }
    c.set("operationId", result.data);
    await next();
  });

  app.get("/api/foods", async (c) => {
    const foods = await dependencies.foodService.list();
    return c.json({ data: foods.map(foodView), request_id: c.get("requestId") });
  });

  app.post("/api/foods", async (c) => {
    const result = createFoodRequestSchema.safeParse(await readJson(c.req.raw));
    if (!result.success) {
      return respondWithProblem(c, {
        status: 422,
        title: "Validation failed",
        detail: "One or more fields are invalid",
        code: "validation_failed",
        errors: zodIssuesToFieldProblems(result.error.issues),
      });
    }

    const food = await dependencies.foodService.createPersonal(result.data);
    return c.json({ data: foodView(food), request_id: c.get("requestId") }, 201);
  });

  app.patch("/api/foods/:id", async (c) => {
    const params = resourceIdParamsSchema.safeParse({ id: c.req.param("id") });
    if (!params.success) {
      return respondWithProblem(c, {
        status: 422,
        title: "Validation failed",
        detail: "The resource identifier is invalid",
        code: "validation_failed",
        errors: zodIssuesToFieldProblems(params.error.issues),
      });
    }

    const result = updateFoodRequestSchema.safeParse(await readJson(c.req.raw));
    if (!result.success) {
      return respondWithProblem(c, {
        status: 422,
        title: "Validation failed",
        detail: "One or more fields are invalid",
        code: "validation_failed",
        errors: zodIssuesToFieldProblems(result.error.issues),
      });
    }

    const food = await dependencies.foodService.update(params.data.id, result.data);
    return c.json({ data: foodView(food), request_id: c.get("requestId") });
  });

  app.get("/api/measurement-units", async (c) => {
    const units = await dependencies.measurementUnitService.list();
    return c.json({ data: units.map(measurementUnitView), request_id: c.get("requestId") });
  });

  app.post("/api/measurement-units", async (c) => {
    const result = createMeasurementUnitRequestSchema.safeParse(await readJson(c.req.raw));
    if (!result.success) {
      return respondWithProblem(c, {
        status: 422,
        title: "Validation failed",
        detail: "One or more fields are invalid",
        code: "validation_failed",
        errors: zodIssuesToFieldProblems(result.error.issues),
      });
    }
    const unit = await dependencies.measurementUnitService.create(result.data);
    return c.json({ data: measurementUnitView(unit), request_id: c.get("requestId") }, 201);
  });

  app.patch("/api/measurement-units/:id/active", async (c) => {
    const params = resourceIdParamsSchema.safeParse({ id: c.req.param("id") });
    if (!params.success) {
      return respondWithProblem(c, {
        status: 422,
        title: "Validation failed",
        detail: "The resource identifier is invalid",
        code: "validation_failed",
        errors: zodIssuesToFieldProblems(params.error.issues),
      });
    }

    const result = setMeasurementUnitActiveRequestSchema.safeParse(await readJson(c.req.raw));
    if (!result.success) {
      return respondWithProblem(c, {
        status: 422,
        title: "Validation failed",
        detail: "One or more fields are invalid",
        code: "validation_failed",
        errors: zodIssuesToFieldProblems(result.error.issues),
      });
    }
    await dependencies.measurementUnitService.setActive(params.data.id, result.data.active);
    return c.body(null, 204);
  });

  app.post("/api/diagnostics/client-errors", async (c) => {
    const result = clientErrorReportSchema.safeParse(await readJson(c.req.raw));
    if (!result.success) {
      return respondWithProblem(c, {
        status: 422,
        title: "Validation failed",
        detail: "The client diagnostic report is invalid",
        code: "validation_failed",
        errors: zodIssuesToFieldProblems(result.error.issues),
      });
    }
    dependencies.logger.error({
      event: "client.error",
      outcome: "failure",
      request_id: c.get("requestId"),
      operation_id: c.get("operationId"),
      route: new URL(c.req.url).pathname,
      status: 204,
      error_code: "client_error",
      client_route: result.data.route,
      application_version: result.data.applicationVersion,
      location: scrubClientLocation(result.data.location),
      stack: scrubClientStack(result.data.stack),
    });
    return c.body(null, 204);
  });

  app.notFound((c) =>
    respondWithProblem(c, {
      status: 404,
      title: "Route not found",
      detail: "The requested API route does not exist",
      code: "route_not_found",
    }),
  );

  app.onError((error, c) => {
    if (error instanceof ApplicationError) {
      const status = error.kind === "not_found" ? 404 : error.kind === "unavailable" ? 503 : 409;
      return respondWithProblem(c, {
        status,
        title:
          error.kind === "not_found"
            ? "Resource not found"
            : error.kind === "unavailable"
              ? "Service unavailable"
              : "Operation conflict",
        detail: error.message,
        code: error.code,
      });
    }

    dependencies.logger.error({
      event: "request.error",
      outcome: "failure",
      request_id: c.get("requestId"),
      operation_id: c.get("operationId"),
      route: new URL(c.req.url).pathname,
      status: 500,
      error_code: "unexpected_error",
      stack: scrubErrorStack(error),
    });
    return respondWithProblem(c, {
      status: 500,
      title: "Unexpected error",
      detail: "The operation could not be completed",
      code: "unexpected_error",
    });
  });

  return app;
}
