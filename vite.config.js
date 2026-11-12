import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Busts the persisted query cache on every deploy, so a changed data shape
  // is never read back from a visitor's storage. The deploy workflow sets
  // GIT_SHA (docs/06-deployment.md).
  define: {
    __APP_BUILD__: JSON.stringify(process.env.GIT_SHA ?? Date.now().toString(36)),
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    // Mirrors the Nginx proxy, so the client calls a relative /api in every
    // environment.
    proxy: {
      '/api': 'http://localhost:5000',
      // Live updates (new orders in the admin, a shopper's order page): WebSocket to the API.
      '/socket.io': { target: 'http://localhost:5000', ws: true },
    },
  },
})
