# Decisions

## Tier 3 threshold picks

Numbers are starting points, not measured against codebase. Calibrate after real violations land.

| Rule                      | Picked | Source / reasoning                                                                                    |
| ------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `max-lines`               | 400    | Airbnb 300, sonarjs 1000. 400 = middle. Vue SFCs (template+script+style) eat lines fast.              |
| `max-lines-per-function`  | 80     | Airbnb 50, sonarjs 200. 80 ≈ "one screen of code".                                                    |
| `max-depth`               | 4      | ESLint default.                                                                                       |
| `max-nested-callbacks`    | 3      | Airbnb default.                                                                                       |
| `max-classes-per-file`    | 1      | ESLint default.                                                                                       |
| `max-params`              | 4      | ESLint default 3, Airbnb 3. Bumped to 4 because Vue composables often take options object + 2-3 args. |
| `max-statements`          | 25     | ESLint default 10 too tight, trips in trivial code. 25 leaves room for short setup blocks.            |
| `complexity`              | 15     | ESLint default 20, sonarjs 15. Stricter side.                                                         |
| `import/max-dependencies` | 20     | No standard. Sonar 25. Nuxt pages/components import 15+ routinely.                                    |

Severity: all `error`. User dislikes `warn` — either rule matters (error) or doesn't (off). No warn-staging.

## Carve-outs

- `certificate/app.js` — file-level `eslint-disable max-lines-per-function`. Legacy single-file static page wrapped in IIFE (277-line body). Not a recurring pattern. Don't propagate carve-out elsewhere.
- `certificate/app.js` — file-level `eslint-disable` block at top covering `max-lines-per-function` plus the 7 deferred TS rules. TODO note above asks future-us to migrate this static page into the Nuxt app or convert to TypeScript so the strict rules apply.

## Tier 4 — all rules now error

`createDirectus<Schema>(...)` landed in `web/app/composables/directus.ts`. All 8 originally-deferred rules now `"error"`. No rules `"off"` in `vite.config.ts`.

Carve-outs added during flip:

- `web/eslint.config.js:38` — per-line disable `typescript/no-unsafe-argument`. Reason: `@lttr/nuxt-config-eslint` ships JS only (no `.d.ts`), import is implicit `any`.
- `web/app/composables/forms.ts`, `articles.ts`, `biography-expert.ts` — explicit return types added (`UseAsyncRequestResult<FormData>`, `ReturnType<typeof useAsyncData<...>>`). Outer `async` dropped on `useArticle`/`useArticles`/`useBiographyExpert` since they return `useAsyncData()` directly without awaiting.
- `web/shared/utils/{directus,dates,urls}.ts`, `web/app/utils/forms.ts` — explicit return types added (`string`, `Record<string, string>`).

## Calibration approach

Land thresholds at `error`. When a real violation arrives:

- Refactor if rule was right.
- Raise threshold (still `error`) or disable rule entirely if rule was wrong.

Optional later: scan codebase for current p95 (longest function, deepest nesting, max imports) and reset thresholds at p95+10% for evidence-based bar.

## Other Tier 2/3 carve-outs

- `certificate/app.js:194` — inline `// eslint-disable-next-line typescript/prefer-nullish-coalescing` on `slugify(name) || "ucastnik"`. Empty slug must fall back; `??` is wrong because `slugify` returns string and `""` is reachable.
  - **Future option**: configure rule globally with `ignorePrimitives: { string: true }` to drop carve-out and avoid this class of false-positive across repo.

## Vue SFC override (open)

Not needed yet — all Vue files under 400 lines. Revisit when content grows. Likely override pattern:

```ts
// in vite.config.ts
overrides: [
  {
    files: ["web/app/**/*.vue"],
    rules: {
      "max-lines": ["warn", { max: 600, skipBlankLines: true, skipComments: true }],
    },
  },
]
```

(syntax depends on vite-plus override support — verify when needed)
