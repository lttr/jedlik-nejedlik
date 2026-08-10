import { defineConfig } from "vitest/config"

// Unit tests over pure modules — codecs, mappers, decision helpers. No Nuxt
// runtime, no network: anything needing either belongs in the probes
// (`vitest.probes.config.ts`) or in a live round-trip.
//
// Runs through the `vitest-probe` alias for the same reason the probes do —
// see the `directus:probe` task in ../vite.config.ts.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
})
