# jedlik-nejedlik

Educational website **Jedlík-nejedlík** about nutrition and parenting ("výživa a
výchova v propojení") for parents and professionals. Czech-language content site
with a CMS-driven article workflow, landing pages, webinars, and lead-capture
forms.

- **Production:** <https://www.jedlik-nejedlik.cz>
- **CMS (Directus):** <https://obsah-jedlika.lttr.cz>

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
DIRECTUS_TOKEN=<admin-token> vp run directus:pull   # refresh the committed dump
DIRECTUS_TOKEN=<admin-token> vp run directus:diff   # detect drift against the dump
```

**[docs/directus.md](docs/directus.md)** covers the rest: the MCP endpoint,
where a permission rule lives in the admin app and in the dump, the role and
file-folder scoping, and the permission probe suite with its tokens and
fixtures.

## Deployment

Hosted on **Coolify**, built with **Nixpacks**. The
`jedlik-nejedlik-production` app **auto-deploys on push to `master`**.
