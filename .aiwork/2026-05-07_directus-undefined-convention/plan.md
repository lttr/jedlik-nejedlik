---
references:
  - .aiwork/2026-05-07_async-data-error-surfacing/notes.md
  - web/app/composables/images.ts
  - web/app/composables/biography-expert.ts
  - web/app/composables/articles.ts
---

# Standardise Directus → app boundary on undefined / `?:`

Goal: one convention end-to-end. Schemas validate DB-faithful (nullable),
transforms produce app-facing optional-key types. No `null` leaks past the
composable layer.

## Steps

1. Add helper(s) in `web/app/composables/_directus-zod.ts` (or extend
   `web/app/utils/directus.ts`):
   - `opt(schema)` — wraps `.nullish().transform(v => v ?? undefined)` for
     per-field use.
   - Decide between per-field `opt()` or per-object `nullsToOptional()`. Pick
     one, name it, use it everywhere.

2. Rewrite each Directus composable to: `z.object({...opt(field)...})`,
   `z.infer` for the type, parse in `useAsyncData`'s `transform`.
   - `images.ts` ✅ (already on this pattern, swap `.nullable() + transform`
     for `opt()`).
   - `biography-expert.ts` ✅ (same swap).
   - `articles.ts` — currently hand-rolls transform via plain interfaces;
     replace with schema. Two functions: `useArticle`, `useArticles`.
   - `forms.ts` — review whether response shapes need schemas.

3. Drop hand-written `interface Image` from
   `web/app/components/ProfileImg.vue` and `ContentImg.vue`. Import `Image`
   from `images.ts`.

4. Audit other components with local `Image` / `Article` declarations —
   import the inferred type instead.

5. Hand-rolled CMS-shaped objects (e.g. `podcast.vue` zdenka/anicka) stay as
   plain object literals; omit absent keys.

6. CLAUDE.md: append a short paragraph stating the convention, point at the
   helper as the canonical entry point.

## Out of scope

- Surfacing `useAsyncData` errors loudly — separate concern in
  `2026-05-07_async-data-error-surfacing/notes.md`.
- Adding zod to non-Directus boundaries (forms, runtime config — already
  partially done via `safeRuntimeConfig`).

## Open questions

- Per-field `opt()` vs per-object `nullsToOptional()` — which reads cleaner
  for collections with 5-10 fields?
- Should the helper live in `composables/` (auto-imported) or `utils/`
  (explicit import)? Current `getDirectusClient` is in utils.
