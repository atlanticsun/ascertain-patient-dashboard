import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// VITE_API_URL is baked in at build time. In docker compose it is passed
// as a build arg pointing at the API service.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
