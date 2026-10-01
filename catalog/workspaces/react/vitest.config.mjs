import { defineConfig } from "vitest/config";

// Shared by every React exercise. Tests run in a simulated browser (jsdom).
export default defineConfig({
  test: { environment: "jsdom", globals: true, include: ["**/*.test.{js,jsx}"] },
});
