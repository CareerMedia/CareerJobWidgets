import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://<org>.github.io/<repo-name>/
// Production builds must use the repo subpath so JS/CSS assets resolve correctly.
const GITHUB_PAGES_BASE = "/CareerJobWidgets/";

export default defineConfig(({ mode }) => ({
  base:
    process.env.VITE_BASE_PATH ??
    (mode === "production" ? GITHUB_PAGES_BASE : "/"),
  plugins: [react()],
}));

