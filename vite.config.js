import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

const mobile =
  process.env.TAURI_ENV_PLATFORM?.includes('android') ||
  process.env.TAURI_ENV_PLATFORM?.includes('ios')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: mobile ? '0.0.0.0' : false,
    hmr: mobile
      ? {
          protocol: 'ws',
          host: 'localhost',
          port: 5174,
        }
      : undefined,
  },
  clearScreen: false,
})
