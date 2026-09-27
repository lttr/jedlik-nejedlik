# jedlik-nejedlik

Educational website **Jedlík-nejedlík** about nutrition and parenting ("výživa a
výchova v propojení") for parents and professionals. Czech-language content site
with a CMS-driven article workflow, landing pages, webinars, and lead-capture
forms, plus the course shop (`Kurzy`): Accounts, a Catalog, Sales Pages and a
GoPay Checkout for On-demand Courses.

- **Production:** <https://www.jedlik-nejedlik.cz>
- **CMS (Directus):** `NUXT_PUBLIC_DIRECTUS_URL` in `web/.env`; the admin app is at `/admin` on it

## Tech stack

| Area            | Choice                                                            |
| --------------- | ----------------------------------------------------------------- |
| Framework       | [Nuxt 4](https://nuxt.com) (Vue 3.5, TypeScript)                  |
| CMS             | [Directus](https://directus.io) headless CMS (`@directus/sdk`)    |
| Styling         | [Puleo](https://github.com/lttr/puleo) CSS layer + PostCSS        |
| Fonts           | `@nuxt/fonts` (Poppins, metric-fallback CLS tuning)               |
| Icons           | `@nuxt/icon` (Iconify: `bi`, `logos`, `uil`) + auto-imported SVGs |
| Images          | `@nuxt/image` with the Directus provider                          |
| SEO / OG        | `@nuxtjs/seo` (sitemap, robots, OG image at build time)           |
| Analytics       | [Plausible](https://plausible.io), self-hosted                    |
| Error tracking  | [Sentry](https://sentry.io) (`@sentry/nuxt`)                      |
| Validation      | [Zod](https://zod.dev)                                            |
| Toolchain       | [Vite+](https://viteplus.dev/) (`vp`) — Oxfmt, Oxlint; ESLint     |
| Package manager | pnpm 11 (workspace monorepo)                                      |
| Hosting         | [Coolify](https://coolify.io)                                     |

## Prerequisites

- Node
- pnpm
- [Vite+](https://viteplus.dev/)

## Getting started

```bash
vp install                        # install dependencies
cp web/.env.example web/.env      # seed local env
vp run dev                        # start the Nuxt dev server
```

The example file is a template, not a working config: the app validates its
runtime config at boot (`web/server/runtime-config.schema.ts`) and refuses to
start without a real `NUXT_PUBLIC_DIRECTUS_URL`, a `NUXT_SESSION_PASSWORD` of
at least 32 characters and a `NUXT_SHOP_DIRECTUS_TOKEN`. `NUXT_GOPAY_ENV=mock`
needs no GoPay credentials and runs the payment flow against the dev-only mock
gateway.

## Code quality

Linting is intentionally strict — a large pedantic Oxlint rule set (see the
`lint` block in `vite.config.ts`), plus a separate type-aware ESLint pass
(`web/eslint.config.js`). Rules are either **error** or **off**; never `warn`.

`vp run check:all` runs the full gate, each step independently cached by Vite+:

1. `check:lint` — oxfmt + oxlint (`vp check`)
2. `check:slowlint` — full ESLint
3. `check:typecheck` — `nuxi typecheck`
4. `check:fallow` — dead-code / unused-export detection
5. `check:test` — unit tests (`web/tests/unit/`)

The build is not part of the gate — `vp run build` locally, and the Coolify
deploy build is the signal on `master`.

A **pre-commit hook** runs `vp staged` (auto-formats and `--fix`es staged
files, so on-disk contents may change after `git commit`) and then `check:all`.

## Content & CMS

Directus is the source of content (articles, structured data) and serves images
via the `@nuxt/image` Directus provider. Its configuration is committed under
`directus/config/` and pulled — never pushed — with directus-sync:

```bash
vp run directus:pull   # refresh the committed dump
vp run directus:diff   # detect drift against the dump
```

Both need `DIRECTUS_PROBE_ADMIN_TOKEN` in `web/.env`, the same admin token the
permission probes use. The task says so and stops when it is missing.

What the repo does push are the Czech e-mail templates and the hook
extension under `directus/`, with `vp run directus:push` (needs the `coolify`
CLI).

**[docs/directus.md](docs/directus.md)** covers the rest: the MCP endpoint,
where a permission rule lives in the admin app and in the dump, the role and
file-folder scoping, and the permission probe suite with its tokens and
fixtures.

## Code layout and docs

`web/` is a Nuxt app split into layers under `web/layers/` (`base`, `directus`,
`auth`, `shop` with its nested `mock-gopay`); imports only point down that
stack. The rules, and everything else an agent or contributor needs before
touching code, are in [CLAUDE.md](CLAUDE.md).

- [GLOSSARY.md](GLOSSARY.md): the domain terms (Course, Order, Entitlement, …)
  as the code and the copy use them
- [docs/shop.md](docs/shop.md): how the shop layer sells a Course, from the
  Catalog to GoPay settlement
- [docs/analytics.md](docs/analytics.md): cookie consent and the Meta Pixel and
  Clarity gates
- [docs/directus.md](docs/directus.md): operating the CMS
- [docs/adr/](docs/adr/): the architecture decisions behind all of the above
- [docs/dependency-update-cloud-routine.md](docs/dependency-update-cloud-routine.md):
  the weekly dependency update

## Deployment

Hosted on **Coolify**, built with **Nixpacks**. The
`jedlik-nejedlik-production` app **auto-deploys on push to `master`**.
