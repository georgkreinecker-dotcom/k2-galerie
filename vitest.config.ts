import { defineConfig } from 'vitest/config'

/** Vercel/CI: weniger parallele jsdom-Worker vermeidet OOM/Abbruch nach ~40s beim Production-Build. */
const vercelOrCi = Boolean(process.env.VERCEL || process.env.CI)

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.ts'],
    reporters: ['verbose'],
    maxWorkers: vercelOrCi ? 2 : undefined,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      exclude: ['node_modules/', 'dist/', 'src/tests/', '**/*.test.ts', '**/*.d.ts'],
    },
  },
})
