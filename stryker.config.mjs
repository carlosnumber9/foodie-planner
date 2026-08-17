/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: [
    "src/domain/quantity.ts",
    "src/domain/measurement.ts",
    "src/domain/nutrition.ts",
    "src/domain/food.ts",
    "src/application/food-service.ts",
    "src/application/measurement-unit-service.ts",
  ],
  testRunner: "vitest",
  vitest: {
    configFile: "vitest.config.ts",
    related: true,
  },
  reporters: ["clear-text", "progress", "html"],
  thresholds: {
    high: 95,
    low: 90,
    break: 90,
  },
  coverageAnalysis: "perTest",
};
