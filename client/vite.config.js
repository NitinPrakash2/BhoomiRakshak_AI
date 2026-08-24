import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Aligned with MASTER_DOCUMENTATION.md Section 57 (VITE_API_URL) and Section 40.
// During dev we proxy /api to the Node backend (port 5000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});