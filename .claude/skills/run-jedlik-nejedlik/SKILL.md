---
name: run-jedlik-nejedlik
description: Run and drive the jedlik-nejedlik Nuxt site. Use when asked to start the dev server, build, verify a change in the real app, or screenshot a page. Verify with agent-browser yourself; xdg-open only when the user wants to look.
---

Nuxt 4 site in `web/`, repo root as cwd. Build with `vp run build` — never
`vp build` (raw Vite, fails). `NUXT_PUBLIC_DIRECTUS_URL` comes from the
environment (web env config; local `web/.env`) — missing it → 500.

## Run + verify in a browser

Start with `pnpm dev:agent` — plain `nuxi dev`, skipping the `vp run` wrapper so
the server owns the terminal. HMR is on and works; the `NUXT_NO_WS=1` workaround
that used to be here is gone (vite-plus 0.2.5 double-upgraded the HMR socket and
crashed on browser connect, 0.3.0 does not — verified 2026-08-27). Run in a
persistent Monitor:

```bash
# Monitor tool, persistent: true
cd "$(git rev-parse --show-toplevel)" && pnpm dev:agent 2>&1 | grep -E --line-buffered -A 12 "ERROR|Error:|✘|Internal server error|Using alternative port"
```

Wait for `curl -sf http://127.0.0.1:3000/` (~15s warm). Then:

```bash
agent-browser open http://127.0.0.1:3000/       # exec path + proxy: env setup script
agent-browser screenshot /tmp/jedlik-home.png   # absolute paths
```

Stop: TaskStop the monitor, then
`kill "$(ss -ltnp | grep ':3000' | grep -oP 'pid=\K[0-9]+' | head -1)"`.
Always kill by port (stored PID or `fuser -k <port>/tcp`), never by pattern —
`pkill -f "nuxi dev"` matches your own shell command line.

Plausible analytics ignores `localhost` and `jedlik-nejedlik-test.lttr.cz`
(custom host `plausible.lttr.cz`) — don't expect events while testing locally.

Plain `pnpm dev` is the human path (same HMR, wrapped in `vp run`).
`xdg-open` only when the user wants to look.
