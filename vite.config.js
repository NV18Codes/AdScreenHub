import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000, // Use a different port to avoid conflicts
    host: true,
    proxy: {
      '/api': {
        target: 'https://2yuh2s8tyv.us-east-1.awsapprunner.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      }
    }
  },
})
