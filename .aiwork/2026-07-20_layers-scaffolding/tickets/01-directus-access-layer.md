---
status: done
blocked_by: []
references:
  - "Spec: ../spec.md"
---

# 01 — Directus access layer

**What to build:** all Directus access code moves into a dedicated
`layers/directus` Nuxt layer, and the marketing site keeps working exactly
as before — articles, forms, and images still load from Directus through
the layer's auto-imported client.

The layer owns: the pure `createDirectusClient(url)` factory and the
`Schema` + collection wire types in its `shared/`, and the
`getDirectusClient()` / `getImageUrl()` app wrapper (moved from the root
app). Root copies are deleted; existing composables compile unchanged via
auto-import. The layer imports nothing from the root app and contains no
domain logic.

Includes the spec's implementation check: confirm whether Nitro auto-imports
a layer's `shared/` dir; if not, add the one-line `nitro.imports.dirs`
fallback in the layer's own config and note the outcome in the spec.

## Acceptance criteria

- [x] `vp run build` and `vp run typecheck` pass
- [x] Homepage and article pages render with live Directus data in dev
      (homepage 200 unchanged; `/clanky` and `/clanky/1` 404 identically to
      production baseline — pre-existing, not a refactor regression; live
      Directus data through the layer client verified on `/pro-odborniky`)
- [x] No Directus access code remains outside `layers/directus`
- [x] Nitro-side auto-import of the layer's `shared/` verified (or fallback
      applied and recorded in the spec)
- [ ] Merged to `master`, Coolify deploy green, production pages unchanged
