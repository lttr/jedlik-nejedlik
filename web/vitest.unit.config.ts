import { defineConfig } from "vitest/config"

import { aliases } from "./vitest.aliases"

export default defineConfig({
  resolve: { alias: aliases },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    passWithNoTests: true,
  },
})
