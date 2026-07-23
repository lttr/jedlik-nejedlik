---
name: run-jedlik-nejedlik
description: Run and drive the jedlik-nejedlik Nuxt site. Use when asked to start the dev server, build, verify a change in the real app, or screenshot a page. Verify with agent-browser yourself; xdg-open only when the user wants to look.
---

Nuxt 4 site in `web/`, repo root as cwd. Build with `vp run build` — never
`vp build` (raw Vite, fails).

## Dev server

Run it inside a persistent Monitor so errors reach you as events and server
death notifies:

```bash
# Monitor tool, persistent: true
cd "$(git rev-parse --show-toplevel)" && vp run dev 2>&1 | grep -E --line-buffered -A 12 "ERROR|Error:|✘|Internal server error|Using alternative port"
```

Wait until `curl -sf http://localhost:3000/` succeeds (up to ~2 min cold).
`Using alternative port` event = :3000 was taken; free it and restart.

Stop: TaskStop the monitor, then kill the listener by port (it's a grandchild
of `vp`): `kill "$(ss -ltnp | grep ':3000' | grep -oP 'pid=\K[0-9]+' | head -1)"`

## Verify / show

```bash
agent-browser open http://localhost:3000/        # default: check it yourself
agent-browser screenshot /tmp/jedlik-home.png    # absolute paths
xdg-open http://localhost:3000/                  # only when the user wants to look
```
