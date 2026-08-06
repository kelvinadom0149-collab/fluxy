import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    globalSetup: ['tests/globalSetup.js'],
    coverage: {
      provider: 'v8',
      // The storefront's only JS lives inline in the HTML; tests/globalSetup.js
      // mirrors it into this module so v8 can instrument it.
      include: ['tests/.generated/site-script.js'],
      // Vitest's defaults exclude everything under tests/, which would drop the
      // mirrored module from the report.
      exclude: [],
      reporter: ['text', 'html'],
      all: false,
    },
  },
});
