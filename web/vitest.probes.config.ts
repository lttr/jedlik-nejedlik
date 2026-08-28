import { defineConfig } from "vitest/config"

// Probe tokens (DIRECTUS_PROBE_*) live in web/.env, which vitest does not
// load on its own — pull it in here so no shell preamble is needed.
process.loadEnvFile(new URL(".env", import.meta.url).pathname)

// On-demand Directus permission probes against the production instance.
// Run via `vp run directus:probe` — deliberately excluded from any default
// test run (probe files use a `.probe.ts` suffix that default vitest
// includes never match, and only this config includes them).
export default defineConfig({
  test: {
    include: ["tests/probes/**/*.probe.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // Network tests: run files sequentially to go easy on the instance.
    fileParallelism: false,
  },
})
