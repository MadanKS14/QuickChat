import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import the Tailwind CSS plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // Add the Tailwind CSS plugin here
  ],
  server: {
    port: 5173, // Your frontend port
    proxy: {
      // Any request starting with /api will be forwarded to your backend
      '/api': {
        target: 'http://localhost:5000', // Your backend server address
        changeOrigin: true, // Recommended for the proxy to work correctly
        secure: false,      // Useful if your backend is not using https
      }
    }
  }
})

