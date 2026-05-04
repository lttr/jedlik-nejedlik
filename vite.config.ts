import { defineConfig } from "vite-plus"

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    semi: false,
    ignorePatterns: [
      "*.min.css",
      ".nuxt/",
      ".output/",
      "cache/",
      "dist/",
      "node_modules",
      "pnpm-lock.yaml",
    ],
  },
})
