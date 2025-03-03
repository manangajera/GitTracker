import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  test: {
    globals: true,  // Enables global test functions like describe, test
    environment: "jsdom", // Simulates a browser environment for React
  },
  
})
