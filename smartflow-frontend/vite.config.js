import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // ← Écoute sur TOUTES les interfaces
    port: 5173,
    strictPort: false      // Peut utiliser un autre port si occupé
  }
})
