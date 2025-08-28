import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { mockApiPlugin } from './vite-mock-plugin.js'

export default defineConfig(({ command }) => ({
  // Serve assets from root to avoid incorrect MIME types in production
  base: '/',
  plugins: [
    vue(),
    // Include mock API middleware only in development
    ...(command === 'serve' ? [mockApiPlugin()] : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}))
