---
name: run-jedlik-nejedlik
description: Run and drive the jedlik-nejedlik Nuxt site. Use when asked to start the dev server, build, verify a change in the real app, or screenshot a page. Drives its own Chrome via agent-browser (headed by default so the user can watch); never a pre-existing browser, never xdg-open.
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

## Drive

`agent-browser` (bundled with Vite+) launches its own Chrome for Testing.
Default to `--headed` so the user can watch and point at things in the same
window; drop the flag when nobody is looking (CI, screenshots-only).

```bash
agent-browser open --headed http://localhost:3000/
agent-browser snapshot                       # interactive elements with refs
agent-browser screenshot "$PWD/shot.png"     # absolute path
```

Rules:

- Drive only the browser `agent-browser` launched. Never `agent-browser connect
  <port>` to a browser already running on the machine — it may hold the user's
  personal or work sessions.
- Never `xdg-open` a URL to show the user something — it opens their default
  browser. The headed session is already visible.
- Wedged CDP call (typically a hung screenshot): `agent-browser close --all`,
  then reopen. The first `open` after `close --all` can fail once with
  "Failed to connect" — retry it.
- Screenshots meant as evidence go in `.aiwork/<task>/screenshots/`
  (gitignored); scratch ones in the session scratchpad, not `/tmp`.

Plausible analytics ignores `localhost` and `jedlik-nejedlik-test.lttr.cz`, so
no events fire locally.

If the optional `page-bridge` skill is installed, it can replace the `open`
above with a toolbar that lets the user pick elements and send notes; hide the
toolbar before screenshotting. Not required.

## Verify a change

Driving a flow proves it works. It does not prove the page looks right: the
DOM can be correct while the layout is wrong, and no mechanical check will say
so. For every route the change touches:

1. Drive it to the state the change affects.
2. Screenshot it at the default viewport and again at 375px wide
   (`agent-browser set viewport 375 800`).
3. Read the image back and say in a sentence what it looks like. Judge it as a
   page, not as a DOM: spacing, alignment, overflow, anything that looks off
   next to the pages around it. A screenshot nobody looked at is not evidence.

Static correctness is the other bucket: `vp run check:all` (types, tests,
lint, build) never sees a rendered page, and this step never replaces it.

## Stop

TaskStop the Monitor, then free the port by port — never by process pattern
(`pkill -f "nuxi dev"` matches your own shell):

```bash
fuser -k 3000/tcp
agent-browser close --all
```

`pnpm dev` (wrapped in `vp run`) is the human path; same server, same HMR.
