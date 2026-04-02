import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? "http://localhost:80";

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "../macro-tracker-api/dist/public/",
    sourcemap: true, //for debugging
    emptyOutDir: true,
  },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
