import { expect, test } from "@playwright/test";

test("navigates the public catalog and stores preferences without API requests", async ({
  page,
}) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/"))
      apiRequests.push(request.url());
  });
  await page.goto("/recipes");
  await expect(page.getByRole("heading", { name: "Recetas" })).toBeVisible();
  await expect(
    page.getByText("Todavía no hay recetas en tu catálogo."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Más", exact: true }).click();
  await page.getByRole("link", { name: "Alimentos", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Alimentos" })).toBeVisible();
  await page.goto("/more/settings");
  await page.getByLabel("Zona horaria").fill("UTC");
  await page.getByRole("button", { name: "Guardar ajustes" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Cambio guardado en este navegador.",
  );
  await page.getByLabel("Gramo (g)", { exact: true }).click();
  await expect(page.getByLabel("Gramo (g)", { exact: true })).not.toBeChecked();
  await page.reload();
  await expect(page.getByLabel("Zona horaria")).toHaveValue("UTC");
  await expect(page.getByLabel("Gramo (g)", { exact: true })).not.toBeChecked();
  expect(apiRequests).toEqual([]);
});

test("reopens cached routes offline with persisted personal units", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Production service worker offline coverage runs in Chromium.",
  );
  await page.goto("/more/settings");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.getByLabel("Nombre", { exact: true }).fill("Cucharada");
  await page.getByLabel("Código", { exact: true }).fill("spoon");
  await page.getByLabel("Símbolo", { exact: true }).fill("cda");
  await page.getByLabel("Magnitud", { exact: true }).selectOption("volume");
  await page.getByLabel("Cantidad por unidad").fill("15");
  await page.getByRole("button", { name: "Crear unidad" }).click();
  await expect(page.getByLabel("Cucharada (cda)")).toBeChecked();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel("Cucharada (cda)")).toBeChecked();
  await page.goto("/more/foods");
  await expect(page.getByRole("heading", { name: "Alimentos" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-ES");
});

test("exposes an installable Spanish manifest", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    name: "Foodie Planner",
    lang: "es-ES",
    display: "standalone",
    start_url: "/recipes",
  });
});
