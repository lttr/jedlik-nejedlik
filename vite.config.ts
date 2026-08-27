import { defineConfig } from "vite-plus"

const ignorePatterns = [
  // Machine-generated directus-sync dump — formatting it would fight
  // every `vp run directus:pull`.
  "directus/config/**",
  // Agent tooling, not app code: helper scripts under .claude/ live outside
  // any tsconfig, so type-aware rules resolve their Node imports to `error`
  // and report phantom violations when linted file-by-file.
  ".claude/**",
  "**/.nuxt/**",
  "**/.output/**",
  "**/cache/**",
  "**/dist/**",
  "**/node_modules/**",
  "**/*.min.css",
  "pnpm-lock.yaml",
]

// Generated artifacts excluded from cache-input tracking. The bare `.nuxt` /
// `.output` entries are needed next to their `/**` forms: the glob matches the
// contents, not the directory itself, so the first run after a build otherwise
// counts as "'.output' added in 'web'" and cold-runs every task.
const generatedInput = [
  "!**/.nuxt",
  "!**/.nuxt/**",
  "!**/.output",
  "!**/.output/**",
  "!**/node_modules/.cache/**",
  "!**/node_modules/.vite/**",
  "!**/node_modules/.vite-temp/**",
  "!**/*.tsbuildinfo",
]

// Also excludes .aiwork/** and markdown: the implement workflow appends to
// notes continuously, and none of these tools read a markdown file.
const srcInput = [{ auto: true }, "!**/.aiwork/**", "!**/*.md", ...generatedInput]

// `vp check` is the one task that does read markdown — it formats it. Tracking
// md keeps its cache sound (an unformatted note can no longer hide behind a
// stale hit) and costs a ~2.5s re-run, not a full rebuild.
const checkInput = [{ auto: true }, ...generatedInput]

export default defineConfig({
  staged: {
    "*": [() => "vp run nuxt:prepare", "vp check --fix", () => "scripts/check-probe-stamp.sh"],
  },
  run: {
    cache: {
      // Disabled in CI because vite-plus 0.1.20 script-cache tracing
      // makes the Coolify build step hang until it times out.
      scripts: process.env.CI !== "true",
    },
    tasks: {
      // Type-aware linters read `.nuxt` types from disk without regenerating.
      "nuxt:prepare": {
        command: "nuxi prepare",
        cwd: "web",
        input: srcInput,
        output: ["web/.nuxt/**", "!web/.nuxt/cache/**", "!web/.nuxt/dev/**", "!web/.nuxt/dist/**"],
      },
      // Tools run directly (not via nested `vp run -r`) so the cached unit is
      // the leaf command and `srcInput` applies to it.
      "verify:check": { command: "vp check", input: checkInput, dependsOn: ["nuxt:prepare"] },
      "verify:slowlint": {
        command: "eslint .",
        cwd: "web",
        input: srcInput,
        dependsOn: ["nuxt:prepare"],
      },
      "verify:typecheck": {
        command: "nuxi typecheck",
        cwd: "web",
        input: srcInput,
        dependsOn: ["nuxt:prepare"],
      },
      "verify:fallow": { command: "fallow", input: srcInput },
      "verify:test": {
        command: "vp test run --config vitest.unit.config.ts",
        cwd: "web",
        input: srcInput,
      },
      // Network-facing Directus config-as-code commands — never cache, a
      // replayed result would mask drift on the live instance.
      "directus:pull": { command: "directus-sync pull", cache: false },
      "directus:diff": { command: "directus-sync diff", cache: false },
      // On-demand permission probes against the production instance; not in
      // verify:all on purpose.
      // Stamps .directus-probe-stamp on success — the pre-commit probe gate
      // (scripts/check-probe-stamp.sh) requires a stamp newer than staged
      // permission-touching files.
      "directus:probe": { command: "scripts/directus-probe.sh", cache: false },
      "verify:build": { command: "nuxi build", cwd: "web", input: srcInput },
      "verify:all": {
        command: "echo verify done",
        dependsOn: [
          "verify:check",
          "verify:slowlint",
          "verify:typecheck",
          "verify:fallow",
          "verify:test",
          "verify:build",
        ],
      },
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
      "typescript/no-misused-promises": "error",
      "typescript/switch-exhaustiveness-check": "error",
      "typescript/prefer-nullish-coalescing": "error",
      "typescript/restrict-plus-operands": "error",
      "typescript/return-await": "error",
      "typescript/no-deprecated": "error",
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": [
        "error",
        { max: 80, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      "max-depth": ["error", 4],
      "max-nested-callbacks": ["error", 3],
      "max-classes-per-file": ["error", 1],
      "import/max-dependencies": ["error", { max: 20, ignoreTypeImports: true }],
      "no-fallthrough": "error",
      "typescript/no-confusing-void-expression": "error",
      "typescript/strict-boolean-expressions": "error",
      "typescript/no-unsafe-argument": "error",
      "typescript/no-unsafe-assignment": "error",
      "typescript/no-unsafe-call": "error",
      "typescript/no-unsafe-member-access": "error",
      "typescript/no-unsafe-return": "error",
      "typescript/no-mixed-enums": "error",
      "typescript/prefer-ts-expect-error": "error",
      "unicorn/consistent-empty-array-spread": "error",
      "unicorn/no-array-callback-reference": "error",
      "unicorn/escape-case": "error",
      // Restriction
      "no-var": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "import/no-cycle": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-module": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-non-null-assertion": "error",
      "typescript/no-import-type-side-effects": "error",
      "typescript/no-empty-object-type": "error",
      "vue/no-import-compiler-macros": "error",
      "vue/no-multiple-slot-args": "error",
      complexity: ["error", 15],
      "typescript/no-namespace": "error",
      "typescript/no-require-imports": "error",
      "typescript/no-var-requires": "error",
      "typescript/use-unknown-in-catch-callback-variable": "error",
      "typescript/promise-function-async": "error",
      "typescript/explicit-module-boundary-types": "error",
      "node/no-process-env": "error",
      "unicorn/no-process-exit": "error",
      "unicorn/no-array-for-each": "error",
      "unicorn/no-array-reduce": "error",
      // Style
      curly: "error",
      "prefer-const": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "prefer-object-spread": "error",
      "no-useless-computed-key": "error",
      "no-implicit-coercion": "error",
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "max-params": ["error", 4],
      "max-statements": ["error", 25],
      // Nursery
      "typescript/no-unnecessary-condition": "error",
      "typescript/prefer-optional-chain": "error",
      "oxc/branches-sharing-code": "error",
      "promise/no-return-in-finally": "error",
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
    overrides: [
      {
        // Build config files legitimately read process.env at build time.
        files: ["**/*.config.{ts,js,mjs,cjs}"],
        rules: {
          "node/no-process-env": "off",
        },
      },
      {
        // Directus API probes read role tokens from the environment at
        // runtime (see web/tests/probes/support.ts) and assert on dynamic
        // API JSON, where narrowing assertions are the test idiom. Probes
        // run sequentially on purpose (deletion order, dependent state),
        // and describe() blocks routinely exceed the function-length cap.
        files: ["web/tests/**"],
        rules: {
          "node/no-process-env": "off",
          "typescript/no-unsafe-type-assertion": "off",
          "no-await-in-loop": "off",
          "max-lines-per-function": "off",
          // Shared probe helpers assert internally (nonEmptyItems/items).
          "vitest/expect-expect": [
            "error",
            { assertFunctionNames: ["expect", "items", "nonEmptyItems"] },
          ],
        },
      },
      {
        // Ambient .d.ts declarations frequently use side-effect imports
        // (e.g. @total-typescript/ts-reset).
        files: ["**/*.d.ts"],
        rules: {
          "import/no-unassigned-import": "off",
        },
      },
      {
        // @lttr/nuxt-config-eslint ships JS only, so its default export lands
        // here as `any`. Off only the rule that fires on that one call.
        files: ["**/eslint.config.{js,mjs,cjs}"],
        rules: {
          "typescript/no-unsafe-argument": "off",
        },
      },
    ],
  },
  fmt: {
    semi: false,
    ignorePatterns,
  },
})
