import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

// Read package.json to get production API URL
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))
const productionApiUrl = packageJson.productionApiUrl

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    'import.meta.env.VITE_PRODUCTION_API_URL': JSON.stringify(productionApiUrl)
  },
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
        target: productionApiUrl.replace('/api/v1', ''),
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      }
    }
  },
})
