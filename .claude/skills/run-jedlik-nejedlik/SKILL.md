---
name: run-jedlik-nejedlik
description: Run and drive the jedlik-nejedlik Nuxt site. Use when asked to start the dev server, build, verify a change in the real app, or screenshot a page. Drives its own Chrome via agent-browser: headed plus page-bridge when the user is watching, headless when unattended; never a pre-existing browser, never xdg-open.
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

`agent-browser` (bundled with Vite+) launches its own Chrome for Testing. Pick
the mode by whether a human is at the keyboard:

- **Interactive** (the user is watching, pointing, asking for fixes): open
  **headed**, and call the Skill tool with `page-bridge` if it is listed. It
  puts a floating toolbar on the page so the user can pick an element, comment
  on one, or send a note, and each arrives as a live notification with the
  selector and computed styles. Its `open` replaces the one below; it documents
  its own sink, hiding the toolbar before screenshots, and stopping. If the
  skill is not listed, the plain headed session is enough.
- **Unattended** (a subagent, CI, or a task the user handed off to run on its
  own): open headless, no page-bridge — nobody is there to click.

When in doubt, a live chat session is interactive. A window opening
unnecessarily costs nothing; a headless run the user could not see costs a
round trip.

```bash
agent-browser open --headed http://localhost:3000/   # interactive; drop --headed when unattended
agent-browser snapshot                               # interactive elements with refs
agent-browser screenshot "$PWD/shot.png"             # absolute path
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

## Stop

TaskStop the Monitor, then free the port by port — never by process pattern
(`pkill -f "nuxi dev"` matches your own shell):

```bash
fuser -k 3000/tcp
agent-browser close --all
```

`pnpm dev` (wrapped in `vp run`) is the human path; same server, same HMR.
