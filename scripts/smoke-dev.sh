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
npx nuxi dev --port "$PORT" > "$LOG" 2>&1 &
PID=$!
trap '{ kill "$PID" 2>/dev/null; wait "$PID" 2>/dev/null; rm -f "$LOG"; }' EXIT INT TERM

for _ in $(seq 1 60); do
  CODE=$(curl -s -o /tmp/smoke-body.$$ -w "%{http_code}" --max-time 2 "http://localhost:${PORT}/" 2>/dev/null || echo 000)
  case "$CODE" in
    200)
      echo "smoke: HTTP 200"
      exit 0
      ;;
    500)
      echo "smoke: HTTP 500 — runtime error"
      grep -E "ERROR|specifier|stack|message" /tmp/smoke-body.$$ "$LOG" | head -30
      rm -f /tmp/smoke-body.$$
      exit 1
      ;;
  esac
  sleep 0.5
done

echo "smoke: timeout — dev never listened"
tail -30 "$LOG"
exit 2
