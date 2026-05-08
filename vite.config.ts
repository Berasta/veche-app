import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.svg"],
      manifest: {
        name: "Вече",
        short_name: "Вече",
        description: "Древнерусскiй мессенджеръ",
        theme_color: "#0f0a06",
        background_color: "#0f0a06",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icons/192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,ttf}"],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: { cacheName: "images", expiration: { maxEntries: 50, maxAgeSeconds: 86400 * 30 } },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: "NetworkFirst",
            options: { cacheName: "api", expiration: { maxEntries: 100, maxAgeSeconds: 300 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@routes": path.resolve(__dirname, "./src/router"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@entities": path.resolve(__dirname, "./src/entities"),

    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router"],
          ui: ["lucide-react", "motion"],
          pb: ["pocketbase"],
        },
      },
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },

  // Tauri dev server compatibility
  clearScreen: false,
  server: {
    strictPort: true,
  },

  // File types to support raw imports. Never add .csv, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
