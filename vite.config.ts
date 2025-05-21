import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: true, // Make development server accessible on local network
  },
  optimizeDeps: {
    exclude: ["face-api.js"], // Prevent optimization issues with face-api.js
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "face-api": ["face-api.js"],
        },
      },
    },
  },
});
