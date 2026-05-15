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
    tasks: {
      "verify:all": {
        command: "echo verify done",
        dependsOn: ["check", "lint:slow", "typecheck", "smoke", "build"],
      },
      "custom-staged": {
        command: "echo custom staged",
        dependsOn: ["lint:slow", "typecheck", "smoke"],
      },
    },
  },
  lint: {
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
