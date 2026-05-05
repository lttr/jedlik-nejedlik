# Oxlint rules tightening

Goal: extend `vite.config.ts` lint config beyond default `correctness/suspicious/perf` with curated rules from `pedantic`, `restriction`, `style`, `nursery`. Already type-aware.

## Current state (vite.config.ts)

- plugins: eslint, typescript, unicorn, oxc, import, node, promise, vitest, vue
- categories: correctness=error, suspicious=error, perf=error
- typeAware: true, typeCheck: true

## Approach

Cherry-pick. No wholesale category enable except pedantic at `warn` (less risk on CI from future rule additions). Keep style/restriction/nursery off, opt-in by name.

## Tier 1 — high-value, low-noise (error)

Add to `rules` block. Plugin column = where rule lives.

| Rule                                    | Category    | Plugin     |
| --------------------------------------- | ----------- | ---------- |
| eqeqeq                                  | Pedantic    | eslint     |
| no-throw-literal                        | Pedantic    | eslint     |
| no-promise-executor-return              | Pedantic    | eslint     |
| no-self-compare                         | Pedantic    | eslint     |
| no-useless-return                       | Pedantic    | eslint     |
| no-else-return                          | Pedantic    | eslint     |
| no-lonely-if                            | Pedantic    | eslint     |
| no-loop-func                            | Pedantic    | eslint     |
| array-callback-return                   | Pedantic    | eslint     |
| radix                                   | Pedantic    | eslint     |
| symbol-description                      | Pedantic    | eslint     |
| no-var                                  | Restriction | eslint     |
| no-console (allow warn,error)           | Restriction | eslint     |
| prefer-const                            | Style       | eslint     |
| object-shorthand                        | Style       | eslint     |
| prefer-template                         | Style       | eslint     |
| prefer-object-spread                    | Style       | eslint     |
| no-useless-computed-key                 | Style       | eslint     |
| no-implicit-coercion                    | Style       | eslint     |
| import/no-cycle                         | Restriction | import     |
| import/no-duplicates                    | Style       | import     |
| import/first                            | Style       | import     |
| import/consistent-type-specifier-style  | Style       | import     |
| unicorn/prefer-node-protocol            | Restriction | unicorn    |
| unicorn/prefer-module                   | Restriction | unicorn    |
| unicorn/explicit-length-check           | Pedantic    | unicorn    |
| unicorn/new-for-builtins                | Pedantic    | unicorn    |
| typescript/no-explicit-any              | Restriction | typescript |
| typescript/no-non-null-assertion        | Restriction | typescript |
| typescript/no-import-type-side-effects  | Restriction | typescript |
| typescript/no-empty-object-type         | Restriction | typescript |
| typescript/ban-ts-comment               | Pedantic    | typescript |
| typescript/only-throw-error             | Pedantic    | typescript |
| typescript/prefer-includes              | Pedantic    | typescript |
| typescript/prefer-promise-reject-errors | Pedantic    | typescript |
| vue/no-import-compiler-macros           | Restriction | vue        |
| vue/no-multiple-slot-args               | Restriction | vue        |

## Tier 2 — type-aware (error)

| Rule                                   | Category | Plugin     |
| -------------------------------------- | -------- | ---------- |
| typescript/no-misused-promises         | Pedantic | typescript |
| typescript/switch-exhaustiveness-check | Pedantic | typescript |
| typescript/no-unnecessary-condition    | Nursery  | typescript |
| typescript/prefer-optional-chain       | Nursery  | typescript |
| typescript/prefer-nullish-coalescing   | Pedantic | typescript |
| typescript/restrict-plus-operands      | Pedantic | typescript |
| typescript/return-await                | Pedantic | typescript |
| typescript/no-deprecated               | Pedantic | typescript |

## Tier 3 — file/function size limits (warn)

User want these. Tune thresholds after first run.

| Rule                    | Category    | Plugin | Suggested option                                                               |
| ----------------------- | ----------- | ------ | ------------------------------------------------------------------------------ |
| max-lines               | Pedantic    | eslint | `["warn", { max: 400, skipBlankLines: true, skipComments: true }]`             |
| max-lines-per-function  | Pedantic    | eslint | `["warn", { max: 80, skipBlankLines: true, skipComments: true, IIFEs: true }]` |
| max-depth               | Pedantic    | eslint | `["warn", 4]`                                                                  |
| max-nested-callbacks    | Pedantic    | eslint | `["warn", 3]`                                                                  |
| max-classes-per-file    | Pedantic    | eslint | `["warn", 1]`                                                                  |
| max-params              | Style       | eslint | `["warn", 4]`                                                                  |
| max-statements          | Style       | eslint | `["warn", 25]`                                                                 |
| complexity              | Restriction | eslint | `["warn", 15]`                                                                 |
| import/max-dependencies | Pedantic    | import | `["warn", { max: 20, ignoreTypeImports: true }]`                               |

Vue SFCs trip max-lines easily (template+script+style in one file). Either bump max for `**/*.vue` via override, or keep low and force splits.

## Tier 4 — opt-in if appetite (later)

| Rule                                  | Category    | Plugin     |
| ------------------------------------- | ----------- | ---------- |
| typescript/strict-boolean-expressions | Pedantic    | typescript |
| typescript/no-unsafe-argument         | Pedantic    | typescript |
| typescript/no-unsafe-assignment       | Pedantic    | typescript |
| typescript/no-unsafe-call             | Pedantic    | typescript |
| typescript/no-unsafe-member-access    | Pedantic    | typescript |
| typescript/no-unsafe-return           | Pedantic    | typescript |
| unicorn/no-array-for-each             | Restriction | unicorn    |
| unicorn/no-array-reduce               | Restriction | unicorn    |

## Rollout steps

1. Add Tier 1 to `vite.config.ts` `lint.rules`. Run `vp lint --fix`. Review residual, fix or per-line disable.
2. Add Tier 2 in separate commit. Bigger diff expected (type-aware catches deep issues).
3. Add Tier 3 with thresholds above. Tune per-overrides for `**/*.vue` if too many warnings.
4. Tier 4 only after 1-3 settled.
5. Drop nuxt-config-eslint duplicate `vue/no-required-prop-with-default` from custom block (already oxlint default).

## Open questions

- Should Tier 3 thresholds be `warn` or `error`? `warn` recommended initial, promote to `error` once codebase clean.
- Vue SFC line-count override needed? Check baseline by running once with `max-lines: 400`.
- Promote `no-console` from `warn` to `error` once any debug logs cleaned?
- Type-aware lint slowdown acceptable for `vp verify` in pre-commit / CI? Measure after Tier 2.
