import { defineConfig } from "vitest/config"

// Unit tests, part of `vp run check:all` via the `check:test` task.
// Probes live in tests/probes with a `.probe.ts` suffix and their own
// config (vitest.probes.config.ts) — never matched here.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    passWithNoTests: true,
  },
})
