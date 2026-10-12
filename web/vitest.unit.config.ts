import { defineConfig } from "vite-plus"

import { aliases } from "./vitest.aliases"

export default defineConfig({
  resolve: { alias: aliases },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    // Run `nuxt/server` through Vite rather than Node, so a test can mock the
    // runtime config it reads (outside a Nuxt build it is an empty stub).
    server: { deps: { inline: [/node_modules\/nuxt\/dist\/server\//] } },
    passWithNoTests: true,
  },
})
