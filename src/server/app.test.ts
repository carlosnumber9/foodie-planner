import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "../application/errors";
import type { createFoodService } from "../application/food-service";
import type { createMeasurementUnitService } from "../application/measurement-unit-service";
import type { Food } from "../domain/food";
import { toScaledQuantity } from "../domain/quantity";
import { createApp } from "./app";
import type { DiagnosticLogEntry, Logger } from "./logging";

const operationId = "11111111-1111-4111-8111-111111111111";

const food: Food = {
  id: "food-1",
  name: "Tomato",
  measurementType: "mass",
  defaultUnitId: "gram",
  category: "vegetable",
  iconKey: null,
  nutrition: {
    energy: toScaledQuantity(18),
    protein: toScaledQuantity(0.9),
    carbohydrates: toScaledQuantity(3.9),
    fat: toScaledQuantity(0.2),
  },
  source: "personal",
  sourceIdentifier: null,
  sourceVersion: null,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

function createDependencies(options: { authenticated?: boolean } = {}) {
  const entries: Array<{ level: string; entry: DiagnosticLogEntry }> = [];
  const logger: Logger = {
    info: (entry) => entries.push({ level: "info", entry }),
    warn: (entry) => entries.push({ level: "warn", entry }),
    error: (entry) => entries.push({ level: "error", entry }),
  };
  const foodService = {
    list: vi.fn().mockResolvedValue([food]),
    createPersonal: vi.fn().mockResolvedValue(food),
    update: vi.fn().mockResolvedValue(food),
  } as unknown as ReturnType<typeof createFoodService>;
  const measurementUnitService = {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    setActive: vi.fn(),
  } as unknown as ReturnType<typeof createMeasurementUnitService>;

  return {
    entries,
    foodService,
    measurementUnitService,
    dependencies: {
      foodService,
      measurementUnitService,
      identityVerifier: {
        verify: vi.fn().mockResolvedValue(options.authenticated === false ? null : { subject: "user-1" }),
      },
      logger,
      createRequestId: () => "request-1",
      now: vi.fn().mockReturnValueOnce(100).mockReturnValue(125),
    },
  };
}

describe("API app", () => {
  it("returns foods with request correlation", async () => {
    const setup = createDependencies();
    const response = await createApp(setup.dependencies).request("/api/foods");

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("request-1");
    await expect(response.json()).resolves.toEqual({
      data: [
        expect.objectContaining({
          id: "food-1",
          name: "Tomato",
          nutrition: { energy: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2 },
        }),
      ],
      request_id: "request-1",
    });
  });

  it("requires an operation identifier for commands", async () => {
    const setup = createDependencies();
    const response = await createApp(setup.dependencies).request("/api/foods", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    await expect(response.json()).resolves.toMatchObject({
      status: 400,
      code: "operation_id_required",
      request_id: "request-1",
    });
  });

  it("returns stable field paths for invalid input", async () => {
    const setup = createDependencies();
    const response = await createApp(setup.dependencies).request("/api/foods", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-operation-id": operationId,
      },
      body: JSON.stringify({
        name: "",
        measurementType: "mass",
        defaultUnitId: "gram",
        category: "vegetable",
        nutrition: { energy: 10, protein: -1, carbohydrates: 2, fat: 1 },
      }),
    });

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      code: "validation_failed",
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
        expect.objectContaining({ path: "nutrition.protein" }),
      ]),
    });
    expect(setup.foodService.createPersonal).not.toHaveBeenCalled();
  });

  it.each([
    { path: "/api/foods/%20", body: { name: "Tomato" } },
    { path: "/api/measurement-units/%20/active", body: { active: false } },
  ])("validates the resource identifier for $path", async ({ path, body }) => {
    const setup = createDependencies();
    const response = await createApp(setup.dependencies).request(path, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-operation-id": operationId,
      },
      body: JSON.stringify(body),
    });

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      code: "validation_failed",
      errors: [expect.objectContaining({ path: "id" })],
    });
    expect(setup.foodService.update).not.toHaveBeenCalled();
    expect(setup.measurementUnitService.setActive).not.toHaveBeenCalled();
  });

  it("creates a food and logs only diagnostic metadata", async () => {
    const setup = createDependencies();
    const response = await createApp(setup.dependencies).request("/api/foods", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-operation-id": operationId,
      },
      body: JSON.stringify({
        name: "Tomato",
        measurementType: "mass",
        defaultUnitId: "gram",
        category: "vegetable",
        iconKey: null,
        nutrition: { energy: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2 },
      }),
    });

    expect(response.status).toBe(201);
    expect(setup.foodService.createPersonal).toHaveBeenCalledOnce();
    expect(setup.entries).toContainEqual({
      level: "info",
      entry: expect.objectContaining({
        event: "command.completed",
        outcome: "success",
        request_id: "request-1",
        operation_id: operationId,
        status: 201,
      }),
    });
    expect(JSON.stringify(setup.entries)).not.toContain("Tomato");
  });

  it("maps application conflicts to Problem Details", async () => {
    const setup = createDependencies();
    vi.mocked(setup.foodService.createPersonal).mockRejectedValue(
      new ApplicationError("incompatible_unit", "conflict", "Unit does not match"),
    );
    const response = await createApp(setup.dependencies).request("/api/foods", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-operation-id": operationId,
      },
      body: JSON.stringify({
        name: "Tomato",
        measurementType: "mass",
        defaultUnitId: "litre",
        category: "vegetable",
        iconKey: null,
        nutrition: { energy: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2 },
      }),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "incompatible_unit",
      request_id: "request-1",
    });
    expect(setup.entries).toContainEqual({
      level: "warn",
      entry: expect.objectContaining({
        event: "command.completed",
        error_code: "incompatible_unit",
      }),
    });
  });

  it("hides unexpected errors from responses and private logs", async () => {
    const setup = createDependencies();
    vi.mocked(setup.foodService.list).mockRejectedValue(new Error("SELECT secret_recipe FROM foods"));
    const response = await createApp(setup.dependencies).request("/api/foods");
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toContain("unexpected_error");
    expect(body).not.toContain("SELECT");
    expect(JSON.stringify(setup.entries)).not.toContain("secret_recipe");
    expect(setup.entries).toContainEqual({
      level: "error",
      entry: expect.objectContaining({ event: "request.error", error_code: "unexpected_error" }),
    });
  });

  it("rejects requests without a verified Access identity", async () => {
    const setup = createDependencies({ authenticated: false });
    const response = await createApp(setup.dependencies).request("/api/foods");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ code: "access_identity_required" });
    expect(setup.foodService.list).not.toHaveBeenCalled();
  });

  it("returns Problem Details for unknown API routes", async () => {
    const setup = createDependencies();
    const response = await createApp(setup.dependencies).request("/api/unknown");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      code: "route_not_found",
      request_id: "request-1",
    });
  });

  it("records scrubbed client diagnostics without private error text", async () => {
    const setup = createDependencies();
    const response = await createApp(setup.dependencies).request("/api/diagnostics/client-errors", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-operation-id": operationId,
      },
      body: JSON.stringify({
        applicationVersion: "0.1.0",
        route: "/recipes/opaque-id",
        location: "/assets/app.js:10:20",
        stack: "Error: private recipe name\n    at render (https://example.test/assets/app.js?token=secret:10:20)",
      }),
    });

    expect(response.status).toBe(204);
    expect(setup.entries).toContainEqual({
      level: "error",
      entry: expect.objectContaining({
        event: "client.error",
        client_route: "/recipes/opaque-id",
        application_version: "0.1.0",
        stack: "at /assets/app.js:10:20",
      }),
    });
    expect(JSON.stringify(setup.entries)).not.toContain("private recipe name");
    expect(JSON.stringify(setup.entries)).not.toContain("token=secret");
  });
});
