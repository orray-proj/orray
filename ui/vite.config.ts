import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export const API_URL = process.env.API_URL || 'http://localhost:30081';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({ babel: { plugins: [["babel-plugin-react-compiler"]] } }),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: API_URL,
        changeOrigin: true,
      },
    },
    port: 3333,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          query: ["@tanstack/react-query"],
          xyflow: ["@xyflow/react"],
        },
      },
    },
  },
});
