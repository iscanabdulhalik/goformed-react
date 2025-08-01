// vite.config.js - Bundle optimizasyonu
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      // ✅ JSX runtime optimization
      jsxRuntime: "automatic",
    }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "lodash/get": "lodash-es/get",
    },
  },

  // ✅ Build optimizations
  build: {
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // ✅ Vendor chunk - large external libraries
          vendor: ["react", "react-dom", "react-router-dom"],

          // ✅ UI chunk - UI components
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-label",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "lucide-react",
          ],

          // ✅ Charts chunk - data visualization
          charts: ["recharts"],

          // ✅ Animation chunk - motion libraries
          animation: ["framer-motion"],

          // ✅ Auth chunk - authentication
          auth: ["@supabase/supabase-js"],

          // ✅ Utils chunk - utility libraries
          utils: ["clsx", "tailwind-merge", "class-variance-authority"],
        },

        // ✅ Chunk file naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                .replace(/\.\w+$/, "")
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },

        // ✅ Asset file naming
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

    // ✅ Minification settings
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: [
          "console.log",
          "console.info",
          "console.debug",
          "console.trace",
        ],
      },
      mangle: {
        safari10: true,
      },
    },

    // ✅ Size thresholds
    chunkSizeWarningLimit: 1000, // 1MB warning

    // ✅ Source map for production debugging (optional)
    sourcemap: false, // Set to true if you need source maps in production

    // ✅ CSS code splitting
    cssCodeSplit: true,

    // ✅ Asset inlining threshold
    assetsInlineLimit: 4096, // 4KB - files smaller than this will be inlined
  },

  // ✅ Development optimizations
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

  // ✅ Dependency pre-bundling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "framer-motion",
      "lucide-react",
    ],
    exclude: [
      // Large libraries that benefit from lazy loading
      "recharts",
    ],
  },

  // ✅ Define globals to reduce bundle size
  define: {
    // Remove in production
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
  },
});
