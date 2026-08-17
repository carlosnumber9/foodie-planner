import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/server/persistence/schema.ts",
  out: "./db/migrations",
});
