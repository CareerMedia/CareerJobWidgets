import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages note:
// - For project pages, set VITE_BASE_PATH to "/<repo-name>/" in your deploy workflow.
// - For local dev, leaving it unset works fine.
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "./",
  plugins: [react()],
});

