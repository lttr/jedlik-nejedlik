import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

// Vitest does not read web/.env, so load the probe tokens (DIRECTUS_PROBE_*)
// here when that file exists. Shell variables take precedence either way.
const envFile = fileURLToPath(new URL(".env", import.meta.url))
if (existsSync(envFile)) {
  process.loadEnvFile(envFile)
}

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
