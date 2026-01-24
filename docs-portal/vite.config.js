import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import { watch } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

/**
 * Auto-rebuild plugin for config files
 * Watches RCA and VCQ YAML files and automatically rebuilds JSON when they change
 * Prevents serving stale data during development (DEC-252 lesson learned)
 */
function autoRebuildPlugin() {
  let isRebuilding = false;
  const debounceMs = 500;
  let debounceTimer = null;

  const rebuild = (type, scriptPath) => {
    if (isRebuilding) return;
    isRebuilding = true;

    console.log(`\n🔄 ${type} config changed, rebuilding...`);
    const child = spawn('node', [scriptPath], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      isRebuilding = false;
      if (code === 0) {
        console.log(`✅ ${type} data rebuilt successfully\n`);
      } else {
        console.error(`❌ ${type} rebuild failed with code ${code}\n`);
      }
    });
  };

  return {
    name: 'auto-rebuild-config',
    configureServer() {
      // Watch RCA requirements directory
      const rcaDir = join(__dirname, 'config/rca/requirements');
      const rcaScript = join(__dirname, 'scripts/build-rca.js');

      try {
        watch(rcaDir, { recursive: true }, (eventType, filename) => {
          if (filename?.endsWith('.yaml')) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => rebuild('RCA', rcaScript), debounceMs);
          }
        });
        console.log('👀 Watching RCA config files for changes');
      } catch (err) {
        console.warn('⚠️  Could not watch RCA directory:', err.message);
      }

      // Watch VCQ requirements directory
      const vcqDir = join(__dirname, 'config/vcq');
      const vcqScript = join(__dirname, 'scripts/build-vcq.js');

      try {
        watch(vcqDir, { recursive: true }, (eventType, filename) => {
          if (filename?.endsWith('.yaml')) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => rebuild('VCQ', vcqScript), debounceMs);
          }
        });
        console.log('👀 Watching VCQ config files for changes');
      } catch (err) {
        console.warn('⚠️  Could not watch VCQ directory:', err.message);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [noCacheJsonPlugin(), autoRebuildPlugin(), react()],

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
