import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 80,
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    setupFiles: 'src/setup.ts',
    coverage: {
      provider: 'istanbul' // or 'v8'
    },
  }
})
