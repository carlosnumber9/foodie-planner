import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [], request_id: "playwright-request" }),
    });
  });
});

test("navigates through the responsive application shell", async ({ page }) => {
  await page.goto("/recipes");

  await expect(page.getByRole("heading", { name: "Recetas" })).toBeVisible();
  await page.getByRole("link", { name: "Más" }).click();
  await page.getByRole("link", { name: "Ajustes" }).click();

  await expect(page.getByRole("heading", { name: "Ajustes" })).toBeVisible();
});

test("exposes an installable Spanish PWA manifest", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    name: "Foodie Planner",
    lang: "es-ES",
    display: "standalone",
    start_url: "/recipes",
  });
});

test("declares the Spanish locale in the application document", async ({ page }) => {
  await page.goto("/recipes");

  await expect(page.locator("html")).toHaveAttribute("lang", "es-ES");
});
