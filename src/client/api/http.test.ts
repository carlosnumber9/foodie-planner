import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { apiRequest } from "./http";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API client", () => {
  it("validates successful response bodies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: { id: 42 } }), {
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      apiRequest("/api/example", z.object({ data: z.object({ id: z.string() }) })),
    ).rejects.toBeInstanceOf(z.ZodError);
  });

  it("validates Problem Details before exposing an API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            type: "urn:foodie-planner:problem:conflict",
            title: "Operation conflict",
            status: 409,
            detail: "The operation conflicts with current state",
            code: "conflict",
            request_id: "request-1",
          }),
          { status: 409, headers: { "content-type": "application/problem+json" } },
        ),
      ),
    );

    await expect(apiRequest("/api/example", z.unknown())).rejects.toEqual(
      expect.objectContaining({
        name: "ApiProblem",
        problem: expect.objectContaining({ code: "conflict", request_id: "request-1" }),
      }),
    );
  });

  it("rejects malformed Problem Details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 500, code: "unexpected_error" }), {
          status: 500,
          headers: { "content-type": "application/problem+json" },
        }),
      ),
    );

    await expect(apiRequest("/api/example", z.unknown())).rejects.toBeInstanceOf(z.ZodError);
  });
});
