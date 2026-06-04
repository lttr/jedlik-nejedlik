---
name: run-jedlik-nejedlik
description: Build, run, and drive the jedlik-nejedlik Nuxt site. Use when asked to start the dev server, build the site, smoke-test it, take a screenshot of a page, or interact with the running app in a browser.
---

Nuxt 4 site (SSR, Czech) in `web/`, content from Directus CMS. Driven two ways:
**headless** via `scripts/smoke-dev.sh` (boots dev, curls `/`, exits — fast SSR
sanity), and **visually** via `agent-browser` against a running dev server.

All paths below are relative to the repo root, and commands assume it as cwd.

## Prerequisites

- **Node 24.15.0** (pinned in `.node-version`).
- **Vite+ toolchain** — `vp` on PATH (`~/.vite-plus/bin`). `agent-browser`
  ships with it (bundled Chromium) — no `apt-get`, no Playwright install.
- No system packages needed; this is a web app, not a desktop GUI.

## Setup

```bash
vp install                 # pnpm workspace install (postinstall runs nuxi prepare)
```

Env (`web/.env`, seed from `web/.env.example`):

```bash
NUXT_PUBLIC_DIRECTUS_URL=https://obsah-jedlika.lttr.cz   # required for content
```

`nuxi dev` auto-loads `web/.env`. The **production** `node` server does **not**
(see Gotchas) — pass the var on the command line.

## Build

```bash
vp run build               # = pnpm -r build → nuxi build. ~3–5 min cold.
```

Writes `web/.output/`. **Do not run `vp build`** — it invokes raw Vite (no
`index.html` entry) and fails. Always `vp run build`.

## Run (agent path)

### Headless smoke (fastest — confirms SSR boots without errors)

```bash
vp run smoke               # scripts/smoke-dev.sh: boots nuxi dev on :3199, curls /, kills it
```

Prints `smoke: HTTP 200` on success; `HTTP 500` + stack on SSR runtime errors.
First run compiles cold (>60s) — bump the wrapper's curl loop or pre-warm `.nuxt`
if it times out.

### Visual — dev server + agent-browser

Launch dev (binds **:3000** by default), wait for the build, then drive it:

```bash
# 1. Launch dev detached (vp → @nuxt/cli → nuxt.mjs; the listener is the deepest pid)
setsid bash -c 'cd "$(git rev-parse --show-toplevel)" && vp run dev' > /tmp/nuxt-dev.log 2>&1 < /dev/null &
disown

# 2. Wait until it answers (cold compile ~20–40s)
timeout 90 bash -c 'until curl -sf -o /dev/null http://localhost:3000/; do sleep 1; done'

# 3. Drive + screenshot (agent-browser cwd resets each call — pass absolute paths)
agent-browser open http://localhost:3000/
agent-browser screenshot /tmp/jedlik-home.png
agent-browser eval "location.pathname + ' | ' + document.title"
```

Routes (all SSR): `/`, `/o-nas`, `/pro-rodice`, `/pro-odborniky`, `/podcast`,
`/kontakt`. Navigate with `agent-browser open http://localhost:3000/<route>`.

Screenshots → wherever you point them (use `/tmp/*.png`). Dev log → `/tmp/nuxt-dev.log`.

**Stop the dev server** — `kill` won't reach it via the `vp` parent; target the
listener:

```bash
kill "$(ss -ltnp 2>/dev/null | grep ':3000' | grep -oP 'pid=\K[0-9]+' | head -1)"
```

## Run (human path)

```bash
vp run dev                 # → http://localhost:3000, Ctrl-C to stop
```

Identical to the agent path's server; just foregrounded.

## Production server (deployed shape)

Coolify/nixpacks runs the root `start` script. Locally:

```bash
NUXT_PUBLIC_DIRECTUS_URL=https://obsah-jedlika.lttr.cz \
  node web/.output/server/index.mjs    # serves :3000 from .output/
```

## Gotchas

- **Prod `node` start needs the env var explicitly.** `node .output/server/index.mjs`
  does NOT read `web/.env`. Without `NUXT_PUBLIC_DIRECTUS_URL` it dies at boot:
  `Runtime config validation failed: public.directusUrl: Invalid URL`. Dev (`nuxi`)
  loads `.env` automatically; prod doesn't.
- **Dev server hides behind `vp`.** `vp run dev` spawns `@nuxt/cli` which spawns
  `nuxt.mjs dev` — that grandchild holds the port. Kill the port's actual pid
  (via `ss`), not the `vp` process, or the server keeps listening.
- **`agent-browser` resets cwd** after each command and `text=` CSS selectors
  may miss NuxtLinks — navigate by URL or read hrefs with `eval`, don't rely on
  `click "text=..."`.
- **`nuxt-og-image` is disabled in dev** on purpose (`$development.ogImage.enabled:
false` in `nuxt.config.ts`) — its renderer prompt crashes `nuxi dev` with
  `uv_tty_init EINVAL`. OG images generate at build, so dev loses nothing.

## Troubleshooting

- **`smoke: timeout — dev never listened`**: cold compile exceeded the wrapper's
  loop. Run `vp run dev` once to warm `.nuxt`, then re-run, or raise `SMOKE_PORT`'s
  wait loop in `scripts/smoke-dev.sh`.
- **Prod server stack trace `public.directusUrl: Invalid URL`**: missing env var —
  prefix the command with `NUXT_PUBLIC_DIRECTUS_URL=…` (see Gotchas).
- **`[Vue Router warn]: No match found for ... "/_nuxt/"`** in the prod log:
  harmless asset-prefetch probing; the page still serves 200.
