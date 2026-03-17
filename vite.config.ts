import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devServerHost = env.VITE_DEV_SERVER_HOST || "127.0.0.1";
  const devServerPort = Number(env.VITE_DEV_SERVER_PORT || "5173");

  return {
    plugins: [react()],

    // Make frontend base URL explicit in local development.
    // Example: http://127.0.0.1:5173 from VITE_DEV_SERVER_HOST/PORT.
    server: {
      host: devServerHost,
      port: devServerPort,
    },
    resolve: {
      alias: {
        // '@/' maps to 'src/' so we can write:
        //   import { env } from '@/app/env'
        // instead of:
        //   import { env } from '../../../app/env'
        // This keeps imports stable regardless of file nesting depth.
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/tests/setup.ts",
      css: true,
    },
  };
});
