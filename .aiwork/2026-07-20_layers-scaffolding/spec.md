---
references:
  - "Parent: ../2026-06-09_kurzy-platforma/implementation-areas.md (area 00, TR-1b)"
  - "PRD: ../2026-06-09_kurzy-platforma/spec.md"
---

# Spec — Nuxt layers scaffolding (area 00)

Restructure `web/` to host four Nuxt layers over the existing marketing
site: three empty-but-wired domain layers — `customers`, `lms`, `shop` —
plus a dedicated `directus` layer owning all Directus access code (client
factory, schema types, app wrapper). Deployment stays one Nitro SSR app on
Coolify; build output and existing pages must be provably unchanged.

## Decisions

### 1. Auto-scanned `web/layers/` directory, no `extends`

Nuxt 4 auto-registers every directory under `web/layers/` as a layer
(verified against Nuxt 4.x docs; `web/` runs Nuxt 4.4.4). No `extends`
entry in `web/nuxt.config.ts`.

```
web/layers/
  customers/   # identity: register, login, logout, reset (area 02)
  directus/    # Directus access: client factory, schema types, wrappers
  lms/         # course view, progress, tests, video (areas 06–08)
  shop/        # catalog, checkout, payments, invoicing (areas 03–05)
```

Priority order is project root > layers (alphabetical, z > a). We rely on
no cross-layer overrides, so alphabetical ordering is irrelevant; do not
add numeric prefixes.

### 2. Layer anatomy

Each layer follows the standard Nuxt 4 structure and owns its whole
vertical, including server routes (still compiled into the single Nitro
app):

```
layers/<name>/
  nuxt.config.ts        # required marker; config only when needed
  app/pages/...
  app/components/...
  app/composables/...
  server/...            # e.g. GoPay webhook → shop, video token → lms
```

This satisfies the shared contract "Nitro server routes live inside
`web/`" while keeping route ownership with the layer that owns the flow:
GoPay webhook + Fakturoid in `shop/server/`, video token in
`lms/server/`, ingestion endpoints in whichever home area 09's spec picks.

Component naming: keep Nuxt's default directory-based name prefixing
inside layers (unlike the base app, which sets `pathPrefix: false`).
Base-app component names stay as-is; layer components must not collide
with them — prefix by subdirectory (`components/lesson/Nav.vue` →
`LessonNav`).

### 3. Directus access code: dedicated `layers/directus` layer

Current state: `app/utils/directus.ts` builds a module-level singleton via
`useRuntimeConfig()`, and `app/utils/directus-schema.ts` imports wire
types from composables. Neither is usable from Nitro code, which areas
04/05/08/09 need, and the access code has no owned home.

All Directus access code moves into its own layer:

```
layers/directus/
  nuxt.config.ts
  shared/utils/directus.ts   # createDirectusClient(url) — pure factory,
                             # no Vue/Nitro APIs
  shared/utils/schemas.ts    # zod wire codecs (parse + null→undefined
                             # normalisation); single source of collection
                             # shapes — wire types derive from their inputs
  shared/types/directus.ts   # Schema + collection wire types
                             # (area 01 replaces content with kurzy schema)
  app/utils/directus.ts      # getDirectusClient() singleton via
                             # useRuntimeConfig() + getImageUrl()
                             # (moved from root app/utils)
  server/utils/              # future server client wrapper — NOT built
                             # now; first server consumer (area 04) adds it
```

Root `app/utils/directus.ts` and `app/utils/directus-schema.ts` are
deleted; existing composables keep compiling because the same function and
type names now auto-import from the layer. Wire types
(`ArticleCollection`, `BiographyExpertCollection`, `FormSubmission`,
`FormCollection`) move out of composables into the layer's
`shared/types/directus.ts`.

Dependency rules (convention — Nuxt merges all layers into one app and
enforces nothing between them):

- Domain layers and the root app consume the `directus` layer only via its
  auto-imported functions and types.
- The `directus` layer imports nothing from other layers or the root app,
  and never gains domain logic — client construction, schema types, wire
  codecs (zod parse/normalisation of Directus responses), and asset-URL
  helpers only.

Verified against installed Nuxt 4.4.4 source: each layer's `shared/utils`
and `shared/types` are scanned for app-side auto-imports
(`nuxt/dist/index.mjs:3782` iterates `_layers`). Nitro-side auto-import of
layer shared dirs is confirmed at implementation: after `nuxi prepare`,
generated `.nuxt/types/nitro-imports.d.ts` declares `createDirectusClient`
from `layers/directus/shared/utils/directus` and exports the types from
`layers/directus/shared/types/directus` — no `nitro.imports.dirs` fallback
needed.
Do not use the `#shared` alias for this layer — it resolves to root
`shared/` only.

### 4. Runtime config and styles: no changes

No new runtime config keys in this area. Validation schema stays single
and base-level at `web/server/runtime-config.schema.ts`; layers that need
keys later extend `runtimeConfig` in their own `nuxt.config.ts` and add
schema entries there. Layers inherit base CSS (Puleo, `main.css`), fonts,
and modules automatically — nothing per-layer.

### 5. Wiring proof: one placeholder page per domain layer

Each domain layer (`customers`, `lms`, `shop`) ships exactly one page at
`/_scaffold/<layer>` rendering the
layer name, with route rule `robots: false` and excluded from sitemap.
These prove pages + config merge per layer and are deleted when the
layer's first real page lands (areas 02, 03, 06). Final route namespaces
(Czech URLs) are decided in those areas, not here. The `directus` layer
needs no placeholder — the marketing composables consuming its client are
the wiring proof.

## Out of scope

- Any auth, catalog, player, or checkout code (areas 02+).
- Directus collections or permissions (area 01).
- Per-request authenticated Directus client (area 02 decides its shape).
- Nixpacks/Coolify config changes — none expected; deploy must work as-is.

## Verification

- `vp run build` passes; `vp run typecheck` passes.
- Dev server: homepage and one marketing page (e.g. `/clanky`) render
  unchanged; article data still loads from Directus (client refactor
  regression check).
- `/_scaffold/customers|lms|shop` render; `/sitemap.xml` and robots do not
  list them.
