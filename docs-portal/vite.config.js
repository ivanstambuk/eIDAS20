import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to disable caching for JSON data files during development
// This prevents needing hard refresh when rebuilding terminology/search
function noCacheJsonPlugin() {
  return {
    name: 'no-cache-json',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Disable caching for JSON files in /data/ folder
        if (req.url?.includes('/data/') && req.url?.endsWith('.json')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [noCacheJsonPlugin(), react()],

  // GitHub Pages deployment configuration
  // Change 'eIDAS20' to your actual repo name if different
  base: '/eIDAS20/',

  build: {
    outDir: 'dist',
    sourcemap: false,

    // Performance optimizations
    target: 'es2020',
    minify: 'esbuild',

    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - needed immediately
          'react-vendor': ['react', 'react-dom'],

          // Router - small but used throughout
          'router': ['react-router-dom'],

          // Heavy AI dependencies - lazy loaded with AIChat
          'ai-webllm': ['@mlc-ai/web-llm'],
          'ai-transformers': ['@xenova/transformers'],

          // Search engine - lazy loaded with search
          'search': ['@orama/orama'],
        },

        // Use hashed filenames for cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },

    // Increase chunk size warning limit (AI libs are large)
    chunkSizeWarningLimit: 1000, // 1MB
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@styles': '/src/styles',
      '@data': '/public/data'
    }
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
