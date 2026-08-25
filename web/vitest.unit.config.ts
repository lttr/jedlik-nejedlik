import { defineConfig } from "vitest/config"

// Unit tests, part of `vp run verify:all` via the `verify:test` task.
// Probes live in tests/probes with a `.probe.ts` suffix and their own
// config (vitest.probes.config.ts) — never matched here.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    passWithNoTests: true,
  },
})
