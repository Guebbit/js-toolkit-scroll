import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/index.ts',
    /**
     * Pinned, because the intersection specs assert on real geometry.
     * The fixtures place their targets at fixed document offsets and the specs
     * scroll to positions computed against this viewport, so a change to
     * Cypress' default would silently move every band they check.
     */
    viewportWidth: 1000,
    viewportHeight: 660
  },
});
