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

## Drive

Browser mechanics belong to the `playwright-cli` skill from the browser plugin
(commands, refs, sessions, output dir). Load it, run its preflight once per
session, and follow it; this section only adds what is specific to this site
and names no tool commands on purpose. The CLI is bundled with Vite+.

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

## Stop

TaskStop the Monitor, then free the port by port — never by process pattern
(`pkill -f "nuxi dev"` matches your own shell):

```bash
fuser -k 3000/tcp
```

Then close the browser session.

`pnpm dev` (wrapped in `vp run`) is the human path; same server, same HMR.
