import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Institutional Intelligence Suite - Deployment Version: v2.1.0 (Critical Cache-Bust)
// Force absolute relative paths for the Vercel Proxy to handle CORS on the server-side
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://currency-crisis.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
