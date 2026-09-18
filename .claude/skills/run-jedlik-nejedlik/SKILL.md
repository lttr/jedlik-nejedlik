---
name: run-jedlik-nejedlik
description: Run and drive the jedlik-nejedlik Nuxt site. Use when asked to start the dev server, build, verify a change in the real app, or screenshot a page. Drives its own browser: headless by default, headed plus page-bridge only when the user is watching that browser now; never a pre-existing browser, never xdg-open.
---

Nuxt 4 site in `web/`, repo root as cwd. Build with `vp run build` — never
`vp build` (raw Vite, fails). `NUXT_PUBLIC_DIRECTUS_URL` must be in the
environment (`web/.env` locally) — missing it → 500. Ask for the value, don't
invent one.

## Start

`pnpm dev:agent` runs plain `nuxi dev` without the `vp run` wrapper, so the
server owns the terminal and its log. HMR works. Run it in a persistent Monitor:

```bash
# Monitor tool, persistent: true
cd "$(git rev-parse --show-toplevel)" && pnpm dev:agent 2>&1 | grep -E --line-buffered -A 12 "ERROR|Error:|✘|Internal server error|Using alternative port"
```

Ready when `curl -sf http://localhost:3000/ >/dev/null` succeeds (~15s cold).
Always address it as `localhost`, never `127.0.0.1` — `nuxi dev` binds the
hostname `localhost`, which may resolve to IPv6 only, and then a v4 probe hangs.
If the log says `Using alternative port`, use that port instead.

## Payments: the mock gateway

`NUXT_GOPAY_ENV` picks the gateway the shop talks to, and `mock` is the only
value that needs no credentials. Put `NUXT_GOPAY_ENV=mock` in `web/.env`
(gitignored) before starting the server: it selects the in-memory gateway
**and** is what puts the gateway page and its routes into the build at all, so
with any other value `/platba-mock/<id>` is a 404.

The Checkout sends the browser to the gateway page, where „Zaplatit" and
„Zrušit" record the state, call the site's own notification URL (rewritten
onto the origin the request came in on, so it never reaches the deployed
site) and redirect to the return URL. The same actions work without a browser,
which is how a flow test pays:

```bash
# create a Payment without the Checkout (dev-only route)
curl -s -X POST http://localhost:3000/api/gopay/mock/payments \
  -H 'content-type: application/json' \
  -d '{"priceCzk":1490,"returnUrl":"https://www.jedlik-nejedlik.cz/objednavka/42/navrat","notificationUrl":"https://www.jedlik-nejedlik.cz/api/gopay/notify"}'
# pay it (or "cancel"); answers 303 to the return URL, notification already sent
curl -s -i -X POST "http://localhost:3000/api/gopay/mock/payments/<id>/decide" \
  -H 'content-type: application/json' -d '{"action":"pay"}'
# "choose" is the third action, with no button on the page: it parks the
# Payment in PAYMENT_METHOD_CHOSEN, the state that settles to nothing and
# leaves the return page pending
curl -s -X POST "http://localhost:3000/api/gopay/mock/payments/<id>/decide" \
  -H 'content-type: application/json' -d '{"action":"choose"}'
# read the recorded state back
curl -s "http://localhost:3000/api/gopay/mock/payments/<id>"
```

The settlement is driven by hand the same way. The notification route answers
`{"status":"paid"}`, `{"status":"unknown"}` for a Payment id no Order carries,
and 500 when the inquiry itself fails — which is also what a restarted dev
server produces, since the mock forgets every Payment while the Orders keep
their ids:

```bash
curl -s -w ' [%{http_code}]\n' "http://localhost:3000/api/gopay/notify?id=<id>"
```

State lives in process memory: restarting the server forgets every Payment.

## Production build

Behaviour gated off in dev (`import.meta.dev`, hostname allow-lists) is only
visible on a built site:

```bash
vp run build
PORT=3100 node web/.output/server/index.mjs
```

Same env requirement as dev. Use a host the gate does not exclude. Observe
third-party scripts by blocking their hosts in the browser session and reading
what the app queued, so nothing real leaves the machine.

A built server also validates the runtime config at boot and refuses to start
on a bad one, which is the only place `NUXT_GOPAY_ENV=mock` gets rejected —
worth a run whenever that schema changes.

## Drive

Browser mechanics belong to the `playwright-cli` skill from the browser plugin
(commands, refs, sessions, output dir). Load it, run its preflight once per
session, and follow it; this section only adds what is specific to this site
and names no tool commands on purpose. The CLI is bundled with Vite+. In a
root container (Claude Code on the web) Chromium only launches with
`launchOptions.chromiumSandbox: false` in the global
`~/.playwright/cli.config.json`; `scripts/cloud-setup.sh` writes it.

**Headless is the default.** Pick the mode by _who consumes the pixels_, not by
whether a human is at the keyboard — in a CLI session someone is always at the
keyboard, so that test always answers "headed" and is useless.

- **Headless** — the screenshots are for you: verification, checking a change
  landed, reading a rendered page. This is most runs. A `/verify` pass is
  **always** headless, even though the user typed the command a minute ago:
  they handed the task off and are not watching the window.
- **Headed** — the user is watching this browser _now_: they asked to see it,
  or you are iterating on a design together. Then also call the Skill tool with
  `page-bridge` if it is listed. It puts a floating toolbar on the page so the
  user can pick an element, comment on one, or send a note, and each arrives as
  a live notification with the selector and computed styles. Its `open`
  replaces the one below; it documents its own sink, hiding the toolbar before
  screenshots, and stopping. If the skill is not listed, the plain headed
  session is enough.

When in doubt, headless. A window the user did not ask for is not free.

Rules:

- Open the site at `http://localhost:3000/` (or the alternative port from the
  log). Drive only the browser the tool launched itself. Never connect to a
  browser already running on the machine — it may hold the user's personal or
  work sessions.
- Never `xdg-open` a URL to show the user something — it opens their default
  browser. The headed session is already visible.
- Headed/headless is fixed when a session opens. No window although you asked
  for one, or a window you did not ask for: close the session, then reopen.
- The mobile pass is a 375px-wide viewport (375×800).
- Screenshots meant as evidence go in `.aiwork/<task>/screenshots/`
  (gitignored); scratch ones in the session scratchpad, not `/tmp`. Save them
  there by absolute path at capture time rather than into the tool's own
  output directory.
- Close the browser when done.

Plausible analytics ignores `localhost` and `jedlik-nejedlik-test.lttr.cz`, so
no events fire locally.

## Cloud container quirks

- `playwright-cli` is installed as a Vite+ global, and its bin directory is on
  PATH only for shells that read `~/.bashrc`. If the browser plugin's preflight
  says the command is missing, prepend `$HOME/.local/share/vite-plus/bin` to
  PATH and run it again before installing anything.
- `vp run build` fails here in `@nuxt/fonts` with
  `SELF_SIGNED_CERT_IN_CHAIN` fetching Google Fonts: the task does not carry
  the proxy environment. `npx nuxi build` from `web/` is the same build
  (`web/package.json`'s `build` script) and completes.
- The headless Chromium cannot open a TLS tunnel through the container's agent
  proxy: every external host fails with `ERR_CONNECTION_RESET`, so Directus
  images and Sentry never load in the browser, while the Nitro side (and
  `curl`) reach them fine. Verify an image in two steps: `curl` the exact URL
  the `<img>` requests (status 200, `image/png`) as the permission evidence,
  then hand the browser those bytes for that URL with `run-code` and
  `page.context().route(pattern, route => route.fulfill({ path, contentType }))`
  so the layout screenshot shows a real image. Say so in the evidence; never
  put the workaround in app code.
- The Vite watcher occasionally misses a template edit under `web/layers/**`
  (a `touch` does not help). If the served HTML still shows the old markup
  after ~10s, restart the dev server (Stop below, then Start).

## Stop

TaskStop the Monitor, then free the port by port — never by process pattern
(`pkill -f "nuxi dev"` matches your own shell):

```bash
fuser -k 3000/tcp
```

Then close the browser session.

`pnpm dev` (wrapped in `vp run`) is the human path; same server, same HMR.
