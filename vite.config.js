import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: "/Autointellica-data-analytics/", // Add trailing slash
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://autointellica-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        // Add these for better debugging
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    // Ensure assets are loaded from correct path
    assetsDir: 'assets',
  }
})