import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.ts'],
    setupFiles: ['tests/setup.ts'],
    // Every suite installs its own globals (IntersectionObserver, matchMedia).
    // Restoring between tests keeps a stub from one file leaking into the next.
    restoreMocks: true,
    unstubGlobals: true,
    // Type-level assertions are compile-time only. Keeping them in their own
    // file, out of `include`, stops them being reported as runtime tests that
    // in fact assert nothing at runtime.
    typecheck: {
      tsconfig: './tsconfig.test.json',
      include: ['tests/**/*.test-d.ts'],
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // The barrel only re-exports; there is nothing in it to cover or mutate.
      exclude: ['src/index.ts'],
      reporter: ['text', 'json-summary', 'json'],
    },
  },
});
