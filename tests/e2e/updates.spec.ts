import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

test("activates a complete new release only after saving a draft and preserves IndexedDB", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Service-worker release lifecycle is verified in Chromium.",
  );
  const directory = resolve("dist");
  const html = readFileSync(resolve(directory, "index.html"), "utf8");
  const mainPath = /src="([^"]+\.js)"/.exec(html)?.[1];
  if (!mainPath) throw new Error("Production entry bundle is missing");
  const mainScript = readFileSync(
    resolve(directory, mainPath.slice(1)),
    "utf8",
  );
  const serviceWorker = readFileSync(resolve(directory, "sw.js"), "utf8");
  let nextRelease = false;
  const contentTypes: Record<string, string> = {
    js: "application/javascript",
    css: "text/css",
    png: "image/png",
    webmanifest: "application/manifest+json",
    html: "text/html",
  };
  // An isolated static server serves two complete releases without editing repository files.
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    response.setHeader("Cache-Control", "no-store");
    if (pathname === "/sw.js") {
      response.setHeader("Content-Type", "application/javascript");
      response.end(
        nextRelease
          ? serviceWorker
              .replace(mainPath.slice(1), "assets/release-two.js")
              .replace(/(url:"index.html",revision:")[^"]+/, "$1release-two")
          : serviceWorker,
      );
      return;
    }
    if (pathname === "/assets/release-two.js") {
      response.setHeader("Content-Type", "application/javascript");
      response.end(mainScript.replace("Tu catálogo", "Catálogo actualizado"));
      return;
    }
    try {
      const path = resolve(directory, `.${pathname}`);
      if (!path.startsWith(`${directory}/`)) throw new Error("Not an asset");
      const extension = pathname.split(".").at(-1) ?? "";
      if (extension === "html") throw new Error("Serve release HTML");
      const data = readFileSync(path);
      response.setHeader(
        "Content-Type",
        contentTypes[extension] ?? "application/octet-stream",
      );
      response.end(data);
    } catch {
      response.setHeader("Content-Type", "text/html");
      response.end(
        nextRelease ? html.replace(mainPath, "/assets/release-two.js") : html,
      );
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Test server address unavailable");
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    await page.goto(`${origin}/recipes`);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.goto(`${origin}/more/settings`);
    await page.getByLabel("Zona horaria").fill("UTC");
    await page.getByRole("button", { name: "Guardar ajustes" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Cambio guardado en este navegador.",
    );
    await page.getByLabel("Zona horaria").fill("Europe/Madrid");
    nextRelease = true;
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())?.update();
    });
    await expect(
      page.getByText(
        "Hay una actualización, pero primero guarda o descarta tus cambios.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Actualizar ahora" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Guardar ajustes" }).click();
    const activated = page.waitForEvent("framenavigated", {
      predicate: (frame) => frame === page.mainFrame(),
    });
    await page.getByRole("button", { name: "Actualizar ahora" }).click();
    await activated;
    await expect(page.getByLabel("Zona horaria")).toHaveValue("Europe/Madrid");
    await page.goto(`${origin}/recipes`);
    await expect(
      page.getByText("Catálogo actualizado", { exact: true }),
    ).toBeVisible();
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done, reject) =>
      server.close((error) => (error ? reject(error) : done())),
    );
  }
});
