import { describe, expect, it } from "vitest";

import { createClientErrorReport } from "./diagnostics";

describe("client diagnostics", () => {
  it("omits error messages and URL query values", () => {
    const error = new Error("private recipe name");
    error.stack =
      "Error: private recipe name\n    at render (https://example.test/assets/app.js?token=secret:10:20)";

    expect(
      createClientErrorReport(error, {
        applicationVersion: "0.1.0",
        route: "/recipes/opaque-id?private=value",
        location: "https://example.test/assets/app.js?token=secret:10:20",
      }),
    ).toEqual({
      applicationVersion: "0.1.0",
      route: "/recipes/opaque-id",
      location: "/assets/app.js:10:20",
      stack: "at /assets/app.js:10:20",
    });
  });
});
