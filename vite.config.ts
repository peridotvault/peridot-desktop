import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import wasm from "vite-plugin-wasm";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    tailwindcss(),
    wasm(),
  ],
  resolve: {
    alias: {
      "@features": fileURLToPath(new URL("./src/areas/main/features", import.meta.url)),
      "@pages": fileURLToPath(new URL("./src/areas/main/pages", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
      "@interfaces": fileURLToPath(new URL("./src/interfaces", import.meta.url)),
      "@services": fileURLToPath(new URL("./src/services", import.meta.url)),
      "@login": fileURLToPath(new URL("./src/areas/login", import.meta.url)),
      "@main": fileURLToPath(new URL("./src/areas/main", import.meta.url)),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
