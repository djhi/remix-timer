import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/remix-timer/" : "/",
  plugins: [
    tailwindcss(),
    VitePWA({ registerType: "autoUpdate" }),
    react({
      jsxImportSource: "@remix-run/component",
    }),
  ],
}));
