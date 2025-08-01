// vite.config.js - ESBuild minify ile (Terser'a gerek yok)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ✅ Lodash import sorunlarını çöz
      "lodash/get": "lodash-es/get",
      "lodash/isNil": "lodash-es/isNil",
      "lodash/isString": "lodash-es/isString",
      "lodash/isFunction": "lodash-es/isFunction",
      "lodash/flatMap": "lodash-es/flatMap",
      "lodash/isNaN": "lodash-es/isNaN",
      "lodash/isNumber": "lodash-es/isNumber",
      lodash: "lodash-es",
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-label",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "lucide-react",
          ],
          charts: ["recharts"],
          animation: ["framer-motion"],
          auth: ["@supabase/supabase-js"],
          utils: ["clsx", "tailwind-merge", "class-variance-authority"],
        },
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },

    // ✅ ESBuild kullan (Terser'dan daha hızlı ve dependency gerektirmez)
    minify: "esbuild",

    // ✅ ESBuild minify options
    esbuild: {
      drop: ["console", "debugger"], // Console.log'ları production'da kaldır
      legalComments: "none", // Yasal yorumları kaldır
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },

    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,

    // ✅ Build target - modern browsers için optimize et
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
  },

  server: {
    port: 5173,
    host: "localhost",
    strictPort: true,
  },

  preview: {
    port: 5173,
    host: "localhost",
    strictPort: true,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "framer-motion",
      "lucide-react",
      "recharts",
      "lodash-es",
      "lodash-es/get",
      "lodash-es/isNil",
      "lodash-es/isString",
      "lodash-es/isFunction",
      "lodash-es/flatMap",
      "lodash-es/isNaN",
      "lodash-es/isNumber",
    ],
    esbuildOptions: {
      mainFields: ["module", "main"],
      conditions: ["module"],
    },
  },

  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
  },
});
