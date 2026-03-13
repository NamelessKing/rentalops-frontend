import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

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
});
