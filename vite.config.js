import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    sourcemap: false,
    target: "es2020",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          query: ["@tanstack/react-query", "axios", "socket.io-client"],
          ui: ["framer-motion", "notistack", "react-icons", "react-datepicker"],
          print: ["html2canvas", "jspdf"],
        },
      },
    },
  },
});
