import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173, // Your frontend will run on this port
    proxy: {
      // Any request from your client that starts with /api
      // will be automatically forwarded to your backend server.
      '/api': {
        target: 'http://localhost:5000', // The URL of your backend server
        changeOrigin: true, // This is recommended for the proxy to work correctly
      },
    },
  },
})

