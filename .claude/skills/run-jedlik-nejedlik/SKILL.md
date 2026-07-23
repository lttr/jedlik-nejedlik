---
name: run-jedlik-nejedlik
description: Run and drive the jedlik-nejedlik Nuxt site. Use when asked to start the dev server, build, verify a change in the real app, or screenshot a page. Verify with agent-browser yourself; xdg-open only when the user wants to look.
---

Nuxt 4 site in `web/`, repo root as cwd. Build with `vp run build` — never
`vp build` (raw Vite, fails). `NUXT_PUBLIC_DIRECTUS_URL` comes from the
environment (web env config; local `web/.env`) — missing it → 500.

## Run + verify in a browser

Start with `pnpm dev:agent` (not `dev`) — runs nuxi with `NUXT_NO_WS=1` to drop
the HMR socket, which vite-plus 0.2.5 double-upgrades and crashes on connect.
No HMR, but the page SSRs and survives reloads. Run in a persistent Monitor:

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

Plain `pnpm dev` (HMR on) is the human path — don't drive it with agent-browser.
`xdg-open` only when the user wants to look.
