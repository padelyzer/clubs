import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    // Excluir tests de Playwright
    exclude: [
      'node_modules/**',
      'tests/**/*.spec.ts', // Excluir archivos .spec.ts (Playwright)
      '**/*.d.ts',
      '**/*.config.*',
      'dist/',
      '.next/',
    ],
    include: [
      '__tests__/**/*.test.ts', // Solo incluir archivos .test.ts (Vitest)
      '__tests__/**/*.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '.next/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})