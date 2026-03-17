import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: true, // Need this to access dev server from mobile devices on local network
    port: 5173,
    allowedHosts: [
      'realtime-controller-system-1.onrender.com',
      'localhost'
    ]
  }
})
