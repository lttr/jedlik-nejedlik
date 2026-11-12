---
references:
  - https://github.com/nuxt/nuxt/pull/36905
  - https://github.com/lttr/nuxt-validated-runtime-config
---

# Native runtime config schema vs `@lttr/nuxt-validated-runtime-config`

## Status of the Nuxt feature (as of 2026-11-12)

- nuxt/nuxt#36905 merged into `main` (v5 line) on 2026-11-08, labelled `5.x`.
- Not in any stable release: latest is `4.6.4` (2026-11-02). `compatibilityVersion: 5` on 4.x does nothing for it yet.
- v4 backport is only announced. Try it via `nuxt-nightly@5x`.

## What native covers

- Standard Schema (Zod etc.) values directly in `runtimeConfig`; compiled to JSON Schema at build, schema lib not bundled.
- Boot fails on missing or invalid values (`NUXT_E8014`). Env overrides are coerced to the declared type, so `destr` is gone.
- Types inferred from the schema, so no manual `PublicRuntimeConfig` augmentation or key-drift guard is needed.
- **Not covered:** refinements (`.url()`, `.min()`), transforms, `superRefine`/cross-field rules, and probably custom messages.
- Unverified: whether `.brand()` survives in the generated types. Bot reviews flagged `nitro.envPrefix`, nested overrides that drop sibling keys, and root unions on `public`; unknown whether the merged code fixed them.

## jedlik impact

Native would only cover the structural checks: the `gopay.env` enum, `coursesPublic`, and the presence of token, secret and URL. It loses the URL format check, `appSecret.min(32)`, the gopay credentials-per-env check and `mock` refused in prod.

## Options

1. Native only: rejected, loses the shop safety checks.
2. Module only: fine on v4, obsolete structural half on v5.
3. Module rebuilt on native (refinements-only layer): worth it only if other apps use the module. It builds on a very new API.
4. Native + small in-repo Nitro plugin for refinements: least maintenance, keeps every current check.

## Recommendation

- Now (Nuxt 4): keep the module unchanged.
- On Nuxt 5 or the v4 backport: go with option 4 (option 3 if the module has other consumers), then deprecate the module.
- When migrating, remove from `web/server/runtime-config.schema.ts`: the `""` placeholders, the manual augmentation, and the `goid`/`clientId`/`clientSecret` string-or-number unions.
