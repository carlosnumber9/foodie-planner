import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import packageJson from "./package.json";
import { loadCatalogFiles } from "./scripts/catalog-files";

loadCatalogFiles();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      includeAssets: ["app-icon-192.png", "app-icon-512.png"],
      manifest: {
        name: "Foodie Planner",
        short_name: "Foodie",
        description: "Planificador personal de cocina, inventario y compra.",
        lang: "es-ES",
        start_url: "/recipes",
        display: "standalone",
        background_color: "#f7f4ed",
        theme_color: "#275447",
        icons: [
          { src: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
