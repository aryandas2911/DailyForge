import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Fixes black screen on page refresh during local development.
    // Without this, refreshing on /login or /signup returns 404
    historyApiFallback: true,
  },

  preview: {
    // Same fix for `vite preview` (local production preview mode).
    historyApiFallback: true,
  },
});
