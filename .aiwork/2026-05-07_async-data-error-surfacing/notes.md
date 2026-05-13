---
references:
  - web/app/composables/images.ts
  - web/app/composables/biography-expert.ts
  - web/app/utils/directus.ts
---

# `useAsyncData` errors don't surface in the UI

## Symptom

Discovered while introducing zod parsing of Directus responses. `ImageSchema`
incorrectly required `mime_type` (Directus actually returns `type`). Result on
`/podcast`:

- `schema.parse()` threw `ZodError`
- `useAsyncData` caught it, set `data` to `null`, exposed it via `.error`
- `<ProfileImg v-if="bio.photo">` evaluated falsy → image silently absent
- No console error, no Nuxt error overlay, no Sentry event in dev

A future shape change in Directus (renamed/removed column) would manifest the
same way: missing UI element, no signal.

## Why this happens

`useAsyncData` is designed to be non-fatal: a failed fetch shouldn't crash the
app. Errors land in the returned `error` ref. Each call site is expected to
read it and react. Nothing escalates by default.

## Options to consider (not decided)

1. Global `vue:error` / `app:error` Nuxt plugin that watches every
   `useAsyncData` error and `console.error`s it in dev + captures in Sentry in
   prod. Single hook, no per-call boilerplate.
2. Lint rule / convention requiring every `useAsyncData` call site to either
   render error state or rethrow. More disciplined, more work.
3. A thin wrapper around `useAsyncData` that escalates parse errors via
   `createError({ fatal: true })` — turns CMS schema drift into a Nuxt error
   page. Heavy for image fetches, fine for page-defining data.

## Scope

Out of scope of the original lint-fix task. Logged here so it isn't forgotten;
revisit when next CMS schema drift bites or before adding more zod schemas to
Directus composables.

## Resolution

2026-05-13: error surfacing implemented as
`web/app/composables/watch-async-data-error.ts`. Single helper
`watchAsyncDataError(key, result.error)` registers `watch(result.error, ...)`
to log in dev (`console.error`) and capture in Sentry in prod
(`captureException` with `asyncDataKey` tag). `vue:error` / `app:error`
not wired — already auto-captured by `@sentry/nuxt`.

Each Directus composable (`useDirectusImage`, `useBiographyExpert`,
`useArticle`, `useArticles`) calls `useAsyncData` directly and then
`watchAsyncDataError(key, result.error)` — no generic wrapper.

Rejected alternatives:

- Plugin hooking `app:rendered` + scanning `nuxtApp._asyncData` — relies on
  private API surface.
- `createUseAsyncData` factory — only presets default options, no hook for
  side effects on error.
- Per-call-site rethrow via `createError({ fatal: true })` — `useAsyncData`
  catches all throws into `.error` ref (asyncData.js:441); escalation would
  need post-await check + page error page, too aggressive for non-critical
  data like decorative images.

## Honest return types — resolved

2026-05-13: composables now annotate
`Promise<AsyncData<T | undefined, NuxtError | undefined>>`. Truthful: data
is `Ref<T | undefined>` while pending and on error. No casts, no lint
disables, all rules (`explicit-module-boundary-types`,
`promise-function-async`, `no-unsafe-type-assertion`) stay on.

### What unlocked it

The generic wrapper `useDirectusAsyncData<TIn, TOut>` was the source of pain.
Inside generic context, `PickFrom<TOut, KeysOf<TOut>>` from Nuxt's overload
return type does NOT simplify to `TOut` — TS keeps the conditional. So any
honest annotation diverged from the body's inferred type, forcing a cast.

Dropping the wrapper removes the generic context. Each composable calls
`useAsyncData(key, handler, { transform })` directly with concrete `TOut`.
At concrete types, `PickFrom<TOut, KeysOf<TOut>>` simplifies to `TOut`,
the loose overload (first match, `DefaultT = undefined`) fires, and its
return `AsyncData<undefined | TOut, NuxtError | undefined>` matches the
annotation exactly. No cast, no disable.

The cross-cutting concern (error watcher) split out into the standalone
`watchAsyncDataError(key, errorRef)` helper — no genericity, no PickFrom
problem.

### Historical attempts (kept for the record)

#### The core obstacle

`useAsyncData` is declared in `node_modules/nuxt/dist/app/composables/asyncData.d.ts`
with eight overloads paired in twos. Each pair has identical parameter
signatures and differs only in `DefaultT`:

- loose: `DefaultT = undefined` → returns `AsyncData<undefined | PickFrom<DataT, K>, ...>`
- strict: `DefaultT = DataT` → returns `AsyncData<PickFrom<DataT, K>, ...>`

At a concrete call site like:

```ts
const r: Promise<{ data: Ref<Image> }> = (async () => useAsyncData(...))()
```

TS uses contextual typing from the annotation to pick the strict overload.
Returns `data: Ref<Image>`. That's why the original signatures typechecked
despite being structurally wrong.

Inside a generic wrapper `useDirectusAsyncData<TIn, TOut>`, there is no
contextual target — TS picks the FIRST matching overload (loose). Result
is `AsyncData<PickFrom<TOut, KeysOf<TOut>> | undefined, ...>`.

`PickFrom<T, KeysOf<T>>` reduces to `T` only when `T` is concrete. In
generic context TS preserves the conditional. So the inferred body type
and any honest annotation like `AsyncData<T | undefined, ...>` are NOT
structurally equal — typechecker rejects assignment in both directions.

#### Attempts

1. **Drop annotations, let TS infer everywhere.** Typecheck passes. But
   oxlint rule `typescript-eslint/explicit-module-boundary-types` requires
   exported functions to have explicit return types. Fails on 5 functions.

2. **Annotate with `ReturnType<typeof useAsyncData<TOut>>`.** This resolves
   to the STRICT variant (`ReturnType` picks the last overload, which is
   the strict one in each pair). Same lie as the original code, just
   re-stated. Cast needed inside wrapper because body inferred loose.
   `no-unsafe-type-assertion` flags the cast as narrowing.

3. **Inline cast with `oxlint-disable-next-line`.** Works lint-wise. User
   pushed back: "I would like to lie less."

4. **Honest type alias `AsyncData<T | undefined, NuxtError | undefined>`.**
   Doesn't match body inference (`PickFrom<TOut, KeysOf<TOut>>` ≠ `TOut`
   in generic context). Either need a cast (back to disable) or import
   `PickFrom`/`KeysOf`.

5. **Import `PickFrom`/`KeysOf` from Nuxt.** Not re-exported from `nuxt/app`.
   `nuxt`'s `package.json` exports only `./app`, no deep paths.
   `nuxt/dist/app/composables/asyncData` is not resolvable per
   exports map. Deep import would break — and would be a private-API
   dependency, same objection as the `_asyncData` plugin approach.

6. **Cast widening `result as DirectusAsyncData<TOut>`** where
   `DirectusAsyncData<T> = AsyncData<T | undefined, NuxtError | undefined>`.
   Conceptually safe (PickFrom<T, KeysOf<T>> ≡ T at runtime), but TS treats
   the two as unrelated and oxlint flags the cast as narrowing. Disable
   needed again.

7. **Async wrapper + async composables.** Wraps return in `Promise<...>`.
   Satisfies `promise-function-async`. Doesn't change anything about the
   PickFrom mismatch — still needs cast or explicit-module-boundary-types
   disable downstream.

#### What actually landed

Option D (not previously considered): remove the generic wrapper
entirely. Split into (i) per-composable direct `useAsyncData` calls
with honest annotations, (ii) standalone `watchAsyncDataError` helper.
No casts. No disables. All rules on.
