import { defineConfig } from "vitest/config"

// On-demand Directus permission probes against the production instance.
// Run via `vp run directus:probe` — deliberately excluded from any default
// test run (probe files use a `.probe.ts` suffix that default vitest
// includes never match, and only this config includes them).
export default defineConfig({
  test: {
    include: ["tests/probes/**/*.probe.ts"],
    testTimeout: 30_000,
    // Network tests: run files sequentially to go easy on the instance.
    fileParallelism: false,
  },
})
