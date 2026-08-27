#!/usr/bin/env bash
# Pre/PostToolUse(Bash) — log verification commands the agent runs itself
# into the scratch log outside the repo (scripts/verify-log.sh).
#
# `pre` stamps the command keyed by tool_use_id; `post` reads it back, so the
# logged duration is the real wall time of the command. Silent by design:
# never blocks, never writes to the transcript.
#
# A Bash command that exits non-zero fires PreToolUse but NOT PostToolUse
# (verified 2026-08-27), so failures would be missing from the log entirely —
# the opposite of what matters. `sweep` closes that: a stamp still unclaimed
# after MIN_SWEEP_AGE_MS is a command that never reported back, and it is
# logged as unresolved, back-dated to when it started. The Stop hook sweeps at
# end of turn; `pre` sweeps a much older backlog as a backstop.
#
# Usage: verify-log-bash.sh {pre|post|sweep}

set -uo pipefail

MODE="${1:-post}"
STAMP_DIR="${TMPDIR:-/tmp}/verify-log-stamps"
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOGGER="$ROOT/scripts/verify-log.sh"

# Nothing in flight can be older than this at Stop; a background command
# started within the window is the one false-positive case.
MIN_SWEEP_AGE_MS=120000
BACKSTOP_AGE_MS=3600000

# Log every stamp older than $1 ms as an unresolved run, then drop it.
sweep() {
  local min_age="$1" now file data start age
  now=$(date +%s%3N)
  [ -d "$STAMP_DIR" ] || return 0
  for file in "$STAMP_DIR"/*; do
    [ -f "$file" ] || continue
    data=$(cat "$file" 2>/dev/null)
    start=$(printf '%s' "$data" | jq -r '.start // empty' 2>/dev/null)
    case "$start" in ''|*[!0-9]*) unlink "$file" 2>/dev/null; continue ;; esac
    age=$(( now - start ))
    [ "$age" -lt "$min_age" ] && continue
    CLAUDE_SESSION_ID=$(printf '%s' "$data" | jq -r '.session // empty') \
      bash "$LOGGER" record \
        --source agent-bash \
        --command "$(printf '%s' "$data" | jq -r '.command // empty')" \
        --exit null \
        --unresolved "no PostToolUse: non-zero exit, denial, or interrupt" \
        --duration-ms null \
        --ts-epoch-ms "$start" \
        --tool-use-id "$(basename "$file")" >/dev/null 2>&1
    unlink "$file" 2>/dev/null
  done
}

if [ "$MODE" = "sweep" ]; then
  sweep "$MIN_SWEEP_AGE_MS"
  exit 0
fi

payload=$(cat)
command=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')
[ -z "$command" ] && exit 0

# Only verification-shaped commands. `git commit` is in because the pre-commit
# hook (vp staged + lint:slow + typecheck + fallow) runs inside it. The
# logger's own bookkeeping is excluded by verify-log.sh itself, which matches
# a logger script in command position only — a command that merely names one
# as an argument (`vp check --fix docs/verify-log.md`) still gets logged.
bash "$LOGGER" is-self "$command" && exit 0
printf '%s' "$command" | grep -qE '(\bvp\b|\bvpx\b|\beslint\b|\boxlint\b|\bnuxi\b|\bvitest\b|\btsc\b|\bfallow\b|git commit|scripts/(directus-probe|check-evidence-table|check-probe-stamp))' || exit 0

id=$(printf '%s' "$payload" | jq -r '.tool_use_id // "unknown"')
stamp="$STAMP_DIR/${id//[^A-Za-z0-9_-]/_}"

if [ "$MODE" = "pre" ]; then
  mkdir -p "$STAMP_DIR"
  jq -nc --argjson start "$(date +%s%3N)" --arg command "$command" \
    --arg session "$(printf '%s' "$payload" | jq -r '.session_id // empty')" \
    '{start: $start, command: $command, session: $session}' > "$stamp"
  sweep "$BACKSTOP_AGE_MS"
  exit 0
fi

start=$(jq -r '.start // empty' "$stamp" 2>/dev/null)
unlink "$stamp" 2>/dev/null
duration=null
case "$start" in ''|*[!0-9]*) start="" ;; esac
[ -n "$start" ] && duration=$(( $(date +%s%3N) - start ))

out=$(mktemp "${TMPDIR:-/tmp}/verify-log-out.XXXXXX")
printf '%s' "$payload" |
  jq -r 'if (.tool_response | type) == "string" then .tool_response
         else (.tool_response.stdout // .tool_response.text // (.tool_response | tostring)) end' \
  > "$out" 2>/dev/null

# The Bash tool_response carries no exit status at all — its keys are
# interrupted, isImage, noOutputExpected, stderr, stdout (verified
# 2026-08-27). Reaching PostToolUse IS the success signal: a non-zero exit
# never gets here, it is caught by the sweep as unresolved. So a resolved
# record is exit 0, an interrupted one 130.
exit_code=$(printf '%s' "$payload" |
  jq -r 'if (.tool_response.interrupted // false) then "130" else "0" end' 2>/dev/null)
case "$exit_code" in ''|*[!0-9]*) exit_code=0 ;; esac

CLAUDE_SESSION_ID=$(printf '%s' "$payload" | jq -r '.session_id // empty') \
  bash "$LOGGER" record \
    --source agent-bash \
    --command "$command" \
    --exit "$exit_code" \
    --duration-ms "$duration" \
    --tool-use-id "$id" \
    --output-file "$out" >/dev/null 2>&1

unlink "$out" 2>/dev/null
exit 0
