import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // GitHub Pages deployment configuration
  // Change 'eIDAS20' to your actual repo name if different
  base: '/eIDAS20/',

  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimize for static hosting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          'react-vendor': ['react', 'react-dom'],
        }
      }
    }
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
  }
})
