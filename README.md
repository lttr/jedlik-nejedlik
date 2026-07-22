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

`vp run verify` runs the full gate, each step independently cached by Vite+:

1. `verify:check` — format + lint (`vp check`)
2. `verify:lint` — full ESLint
3. `verify:typecheck` — `nuxi typecheck`
4. `verify:fallow` — dead-code / unused-export detection
5. `verify:smoke` — dev-server smoke test (`scripts/smoke-dev.sh`)
6. `verify:build` — `nuxi build`

A **pre-commit hook** (`vp staged`) auto-formats and `--fix`es staged files, so
on-disk contents may change after `git commit`.

## Content & CMS

Directus is the source of content (articles, structured data) and serves images
via the `@nuxt/image` Directus provider. Directus exposes a
[Model Context Protocol](https://directus.io/docs/guides/ai/mcp) endpoint for
AI-assisted content management. To wire it into Claude Code:

```bash
claude mcp add --transport http directus <directus-url>/mcp \
  --header "Authorization: Bearer <your-mcp-user-token>"
```

### Directus config as code (pull-only)

The instance's configuration (roles, policies, permissions, flows, settings, …)
and schema snapshot are committed under `directus/config/`, dumped with
[directus-sync](https://github.com/tractr/directus-sync) (config in
`directus-sync.config.cjs`; requires the `directus-extension-sync` extension on
the instance):

```bash
DIRECTUS_TOKEN=<admin-token> vp run directus:pull   # refresh the committed dump
DIRECTUS_TOKEN=<admin-token> vp run directus:diff   # detect drift against the dump
```

The workflow is **pull-only**: Directus is configured in its admin app and
changes are pulled into the repo as reviewable diffs — the dump is never pushed
back. Flow `operations` are excluded from the dump because they embed
third-party API keys (see the note in `directus-sync.config.cjs`).

## Deployment

Hosted on **Coolify**, built with **Nixpacks**. The
`jedlik-nejedlik-production` app **auto-deploys on push to `master`**.
