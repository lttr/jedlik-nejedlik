import { defineConfig } from "vite-plus"

const ignorePatterns = [
  "**/.nuxt/**",
  "**/.output/**",
  "**/cache/**",
  "**/dist/**",
  "**/node_modules/**",
  "**/*.min.css",
  "pnpm-lock.yaml",
]

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    options: {},
  },
  fmt: {
    semi: false,
    ignorePatterns,
  },
})
