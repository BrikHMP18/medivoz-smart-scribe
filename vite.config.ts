import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      clientPort: 8080,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  build: {
    // Production optimizations
    minify: 'esbuild',
    sourcemap: mode === 'production' ? false : true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor chunks for better caching.
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router-dom/')) {
            return 'react-vendor';
          }

          if (id.includes('/node_modules/@supabase/supabase-js/')) {
            return 'supabase-vendor';
          }

          if (
            id.includes('/node_modules/@radix-ui/react-dialog/') ||
            id.includes('/node_modules/@radix-ui/react-dropdown-menu/') ||
            id.includes('/node_modules/@radix-ui/react-select/') ||
            id.includes('/node_modules/@radix-ui/react-toast/')
          ) {
            return 'ui-vendor';
          }

          if (id.includes('/node_modules/@tanstack/react-query/')) {
            return 'query-vendor';
          }
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable gzip compression
    reportCompressedSize: true,
    // Optimize asset inlining
    assetsInlineLimit: 4096,
  },
}));
