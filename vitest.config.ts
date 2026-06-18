import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/dist/**', '**/firestore.rules.test.ts'],
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
