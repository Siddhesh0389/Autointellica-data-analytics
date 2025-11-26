import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base:"/autointellica",
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://autointellica-backend.onrender.com',
        changeOrigin: true
      }
    }
  }
})