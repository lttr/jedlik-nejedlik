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
    rules: {
      // Pedantic
      eqeqeq: "error",
      "no-throw-literal": "error",
      "no-promise-executor-return": "error",
      "no-self-compare": "error",
      "no-useless-return": "error",
      "no-else-return": "error",
      "no-lonely-if": "error",
      "no-loop-func": "error",
      "array-callback-return": "error",
      radix: "error",
      "symbol-description": "error",
      "unicorn/explicit-length-check": "error",
      "unicorn/new-for-builtins": "error",
      "typescript/ban-ts-comment": "error",
      "typescript/only-throw-error": "error",
      "typescript/prefer-includes": "error",
      "typescript/prefer-promise-reject-errors": "error",
      // Restriction
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "import/no-cycle": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-module": "error",
      "typescript/no-explicit-any": "warn",
      "typescript/no-non-null-assertion": "warn",
      "typescript/no-import-type-side-effects": "error",
      "typescript/no-empty-object-type": "error",
      "vue/no-import-compiler-macros": "error",
      "vue/no-multiple-slot-args": "error",
      // Style
      "prefer-const": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "prefer-object-spread": "error",
      "no-useless-computed-key": "error",
      "no-implicit-coercion": "error",
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
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
