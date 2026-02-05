import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'vitest.setup.ts',
        'src/api/**', // Generated API code
        'src/abi/**', // ABI definitions
        'src/manifest/**', // Manifest files
      ],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 40,
        statements: 40,
      },
    },

    mockReset: true,
    restoreMocks: true,
    clearMocks: true,

    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
  },

  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
      'process': 'process',
      'buffer': 'buffer',
      'stream': 'stream-browserify',
      'util': 'util',
    },
  },

  define: {
    'process.env': {},
    'global': 'globalThis',
  },
})
