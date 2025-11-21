/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup/setup.ts",
    coverage: {
      provider: "istanbul",
    },
  },
});
