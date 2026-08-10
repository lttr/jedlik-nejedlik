#!/usr/bin/env bash
# Boot Nuxt dev, fetch /, kill server. Detects SSR-time runtime errors
# (broken plugins, bad runtimeConfig, missing #-import resolution) that
# typecheck and lint can't see. ~6–7s wall on cached deps.
set -u
PORT="${SMOKE_PORT:-3199}"
LOG="$(mktemp -t smoke-dev.XXXXXX.log)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/web"

# Reuse .nuxt if present; nuxi dev incrementally rebuilds.
#
# `setsid` puts the server in its own process group so the trap can kill the
# whole tree. Killing $! alone only reaps the `npx` wrapper and leaves the nuxi
# child running on $PORT: the next run then fails to take Nuxt's dev lock and
# exits, while curl talks to the stale server instead — passing or failing on
# code that is no longer on disk.
setsid npx nuxi dev --port "$PORT" > "$LOG" 2>&1 &
PID=$!
trap '{ kill -- -"$PID" 2>/dev/null; wait "$PID" 2>/dev/null; rm -f "$LOG"; }' EXIT INT TERM

# A 500 is not immediately fatal. Nitro starts serving before the dev server has
# applied runtime config, so an early request can get "runtimeConfig validation
# failed" from a perfectly healthy app — a race that widens whenever .nuxt is
# cold (right after a build, say). Keep polling and only report a 500 that is
# still there at the deadline; a genuinely broken app never stops returning one.
SAW_500=""
for _ in $(seq 1 60); do
  CODE=$(curl -s -o /tmp/smoke-body.$$ -w "%{http_code}" --max-time 2 "http://localhost:${PORT}/" 2>/dev/null || echo 000)
  case "$CODE" in
    200)
      echo "smoke: HTTP 200"
      rm -f /tmp/smoke-body.$$
      exit 0
      ;;
    500)
      SAW_500=1
      ;;
  esac
  sleep 0.5
done

if [ -n "$SAW_500" ]; then
  echo "smoke: HTTP 500 — runtime error"
  grep -E "ERROR|specifier|stack|message" /tmp/smoke-body.$$ "$LOG" | head -30
  rm -f /tmp/smoke-body.$$
  exit 1
fi

rm -f /tmp/smoke-body.$$
echo "smoke: timeout — dev never listened"
tail -30 "$LOG"
exit 2
