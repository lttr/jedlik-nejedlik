# Implementation notes — layers scaffolding

- 2026-07-21: /implement run started. Both tickets ready, clarity gate passed. Plan: subagent per ticket (01 → 02), single push + deploy verification at wrap-up (avoids two production deploys; per-ticket "merged to master, deploy green" criterion is checked off after the wrap-up deploy).
- 2026-07-21: ticket 01 started (status → in-progress).
- 2026-07-21: ticket 01 done — code commit d835edd (`refactor(web): move Directus access code into layers/directus layer`). "Merged to master, Coolify deploy green" left unchecked for wrap-up.

## Ticket 01 — substance

- Nitro `shared/` auto-import finding: Nuxt 4.4.4 DOES scan a layer's `shared/utils` and `shared/types` for Nitro-side auto-imports — after `nuxi prepare`, `.nuxt/types/nitro-imports.d.ts` declares `createDirectusClient` from `layers/directus/shared/utils/directus` and exports the wire types from `layers/directus/shared/types/directus`. No `nitro.imports.dirs` fallback needed; spec Decision 3 updated accordingly.
- Design decision (spec ambiguity): `BiographyExpertCollection` was previously derived from the composable's zod schema (`z.input<typeof BiographyExpertSchema> & { status: string }`). The layer must not import app code or hold zod logic, so the type is now a hand-written interface in `shared/types/directus.ts`. Drift guard: `biographyExpertRequest` in `web/app/composables/biography-expert.ts` carries an explicit `Promise<z.input<typeof BiographyExpertSchema>[]>` return annotation — typecheck fails if the SDK shape derived from the wire type and the zod input diverge.
- `createDirectusClient` uses an explicit `DirectusClient<Schema> & RestClient<Schema>` return type; `ReturnType<typeof createDirectus<Schema>>` alone would erase the `rest()` extension (no `.request`).
- Verification caveat: `/clanky` and `/clanky/1` return 404 in dev — identical to production (https://www.jedlik-nejedlik.cz/clanky is also 404 today), so pre-existing and not a refactor regression; homepage `BlogSection` is commented out, and no error reaches `watchAsyncDataError`. Live Directus data through the moved client verified on `/pro-odborniky` (all four biography experts SSR-rendered) and the exact articles query verified directly against the Directus API (returns the published article). Homepage renders 200 unchanged.
- Simplify pass (4 review agents): reuse/efficiency clean; the single simplification/altitude finding (zod↔wire-type drift) fixed via the return-annotation guard above.
