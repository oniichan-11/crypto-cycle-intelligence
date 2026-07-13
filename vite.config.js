import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base so the build works on GitHub Pages (user.github.io/repo/) as-is
  base: "./",
  server: { port: 5173, strictPort: true },
});
