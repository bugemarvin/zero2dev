import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

// Shared by every Vue exercise. Tests run in a simulated browser (jsdom).
export default defineConfig({
  plugins: [vue()],
  test: { environment: "jsdom", globals: true, include: ["**/*.test.js"] },
});
