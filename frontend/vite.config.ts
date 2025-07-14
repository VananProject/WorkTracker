import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['bp.vananpicture.com'],
    port: 5173,
    host: '0.0.0.0',
    open: true
  }
})
