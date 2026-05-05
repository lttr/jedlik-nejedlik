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
  run: {
    cache: {
      scripts: true,
    },
  },
  lint: {
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "oxc",
      "import",
      "jsdoc",
      "node",
      "promise",
      "vitest",
      "vue",
    ],
    categories: {
      correctness: "error",
      suspicious: "error",
      perf: "error",
    },
    env: {
      browser: true,
      node: true,
      es2024: true,
    },
    ignorePatterns,
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    semi: false,
    ignorePatterns,
  },
})
