import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// Used by "Start app": compiles .vue files and reloads the page when one is saved.
export default defineConfig({ plugins: [vue()] });
