# Implementation notes: explicit imports in Nuxt layers

A log for the maintainer. Each entry is either something you have to act on or
a place where the spec turned out to be wrong. The diff shows what was built.

## Where the spec was wrong

- **`imports: { scan: false }` also drops module composables.** Modules that
  register a dir through `addImportsDir` lose their auto-imports too:
  `useSiteConfig` from nuxt-site-config broke `app.vue` and `kurzy/[slug].vue`
  in typecheck. The spec's claim that "modules register via `addImports`" holds
  for some modules, not all. We use an `imports:dirs` hook in the root
  `nuxt.config.ts` instead, which keeps only dirs under `node_modules/`.
- **`nitro: { imports: { dirs: [] } }` does not stick.** Nitro's
  `resolveImportsOptions` appends `<scanDir>/utils/**/*` for every layer after
  config merging (nitropack 2.13.4, `core/index.mjs`). An inline Nitro module
  runs after that and before `createUnimport`. It filters the dirs the same
  way. h3 and Nitro core stay auto-imported (`defineEventHandler`, `readBody`,
  `useRuntimeConfig`), and so does `useUserSession` from nuxt-auth-utils.
  Proven by the regenerated `.nuxt/types/nitro-imports.d.ts` and by a smoke
  run of the production build: `/api/auth/logout` returns 204, and
  `/api/courses` fails only when it fetches the dummy Directus.
- **Both filters test for `/node_modules/` in the path.** A layer installed
  from npm would therefore keep its auto-imports. We have none.

## Tooling decisions

- **antfu's `nuxt-eslint-auto-explicit-import` was installed, read and
  removed without running it.** Under the hood it is
  `eslint-plugin-unimport`'s `auto-insert` rule fed with the whole unimport
  registry. That means:
  - it inserts imports for Vue and Nuxt core too;
  - it writes value imports for types;
  - it adds one import per symbol, as a relative chain;
  - it knows nothing about components or Nitro.

  Instead, a one-off codemod read the three generated registries in
  `.nuxt/types/{imports,shared-imports,nitro-imports}.d.ts` (they keep values
  and types apart) and `.nuxt/components.d.ts`. It ran ESLint's `Linter` with
  vue-eslint-parser to collect unresolved script references
  (`globalScope.through`), template references (`VExpressionContainer`) and
  component tags. Then it inserted grouped imports and rewrote `../../` chains
  into aliases. Every step was deterministic, so no subagents were needed.

- **Unresolved component tags do not fail typecheck.** Vue treats an unknown
  tag as a plain element. A separate pass over every SFC template (with
  `@vue/compiler-sfc`) confirmed that each PascalCase or kebab-case tag is
  imported or module-provided. SSR of `/kontakt` and `/prihlaseni` renders
  `PageWrapper` and `AuthPanel`, with no raw tags left in the HTML.
- **`web/layers/shop/mock-gopay/tsconfig.json` is new.** Outside mock mode no
  Nuxt tsconfig includes the nested layer, so type-aware oxlint fell back to
  an inferred project that has no `#layers/*` paths. The old relative chains
  never needed paths. `NUXT_GOPAY_ENV=mock nuxi typecheck` passes.
- **Plain vitest has no Nuxt**, so `web/vitest.aliases.ts` mirrors the aliases,
  and `web/tests/tsconfig.json` carries the same `paths`.
- **`rate-limit.test.ts` now stubs `createError` instead of `authError`.**
  `authError` is a real import now, so a global stub no longer reaches it.

## Left as is

- The `/muj-ucet` route rule stays in the auth layer's config next to the
  other identity pages, although the page itself moved to `shop`. Route rules
  are keyed by path, so no import edge is involved.
- `LectureCard.vue`'s unused `id` prop was already reported by fallow before
  this work. It is advisory.
- The `verify` skill was not run, because this environment has no
  `web/.env` and therefore no Directus URL. Instead: `vp run build`, a
  typecheck in mock mode, and the SSR smoke run above with dummy env values.
