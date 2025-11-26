import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base:"/Autointellica-data-analytics",
  server: {
    port: "https://siddhesh0389.github.io/",
    proxy: {
      '/api': {
        target: 'https://autointellica-backend.onrender.com',
        changeOrigin: true
      }
    }
  }
})