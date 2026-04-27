import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss({
      // Configuración para evitar el error
      apply: 'build',
    })
  ],
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "tailwindcss";`
      }
    }
  }
})