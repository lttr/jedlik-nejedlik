#!/usr/bin/env bash
# Structured log of every verification step in a session.
#
# One JSON object per line in a scratch file outside the repo, by default
# ${TMPDIR:-/tmp}/verify-log-<repo>.jsonl (override with $VERIFY_LOG_FILE).
# Written from three places: the Bash tool hook (commands the agent runs), the
# PostToolUse/Stop hooks (their own lint runs), and the agent itself for
# milestones (`event`). Query it with scripts/verify-log-report.sh or jq.
#
# Subcommands:
#   run    --source S [--files "a b"] -- cmd...   run, time, log, forward exit
#   record --source S --command C --exit N --duration-ms D [--output-file F]
#          [--files "a b"] [--tool-use-id ID]     log an already-finished run
#   event  --source S --event E [--message M]     log a milestone
#   path                                          print the log file path

set -uo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-$PWD}")
LOG_FILE="${VERIFY_LOG_FILE:-${TMPDIR:-/tmp}/verify-log-$(basename "$ROOT").jsonl}"
LOG_DIR=$(dirname "$LOG_FILE")

# True for a command that IS the logger's own bookkeeping, so it never logs
# itself. Deliberately narrow: it matches only a logger script in command
# position, never a command that merely mentions one as an argument — a
# `git add scripts/verify-log.sh && git commit` is a commit and belongs in the
# log. Also exposed as `verify-log.sh is-self <command>` for the Bash hook, to
# keep one definition.
is_self() {
  case "$1" in
    *--last-details*) return 0 ;;
  esac
  printf '%s' "$1" |
    awk '{
      n = split($0, segments, /(&&|\|\||[;&|])/)
      for (i = 1; i <= n; i++) {
        s = segments[i]
        sub(/^[[:space:]]+/, "", s)
        # Drop leading env assignments and an explicit interpreter.
        while (s ~ /^[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+/ || s ~ /^(ba)?sh[[:space:]]+/) {
          sub(/^[^[:space:]]+[[:space:]]+/, "", s)
        }
        sub(/[[:space:]].*$/, "", s)
        sub(/^.*\//, "", s)
        if (s ~ /^verify-log(-report|-bash)?\.sh$/) { found = 1 }
      }
      exit
    } END { exit found ? 0 : 1 }'
}

now_ms() { date +%s%3N; }

# Fingerprint of the working tree: HEAD + porcelain status + diff hash. Two
# runs of the same command with the same fingerprint did identical work.
tree_fingerprint() {
  {
    git -C "$ROOT" rev-parse HEAD 2>/dev/null
    git -C "$ROOT" status --porcelain=v1 2>/dev/null
    git -C "$ROOT" diff HEAD 2>/dev/null | sha1sum
  } | sha1sum | cut -c1-12
}

# Task-level cache detail for `vp run` commands. `vp run --last-details`
# replays the previous run's summary from disk (~150ms, read-only, idempotent)
# and is the only place canonical task names appear.
last_details_tasks() {
  local out
  out=$(cd "$ROOT" && timeout 20 vp run --last-details 2>/dev/null) || return 1
  printf '%s\n' "$out" | awk '
    /^  \[[0-9]+\] / {
      line = $0
      sub(/^  \[[0-9]+\] /, "", line)
      name = line
      sub(/: .*$/, "", name)
      cmd = line
      sub(/^[^:]*: /, "", cmd)
      sub(/^[^$]*\$ /, "", cmd)
      next
    }
    /Cache hit/ {
      saved = $0
      if (saved ~ /[0-9.]+s saved/) {
        sub(/^.*- /, "", saved)
        sub(/s saved.*$/, "", saved)
        saved = saved * 1000
      } else {
        saved = 0
      }
      printf "%s\t%s\thit\toutput replayed\t%d\n", name, cmd, saved
      next
    }
    /Cache miss/ {
      reason = $0
      sub(/^.*Cache miss: */, "", reason)
      gsub(/\t/, " ", reason)
      printf "%s\t%s\tmiss\t%s\t0\n", name, cmd, reason
      next
    }
  ' | sed -e 's/\xe2\x9c\x93//g' -e 's/\xe2\x9c\x97//g' -e 's/[[:blank:]]*\t/\t/g' |
    jq -R -s 'split("\n") | map(select(length > 0) | split("\t") |
      {name: .[0], command: .[1], cache: .[2], reason: .[3], saved_ms: (.[4] | tonumber)})'
}

# Cache totals from every "vp run: 1/2 cache hit (50%), 2.53s saved." line in
# the output, summed. Applies to any command, not just `vp run`: a `git commit`
# runs `vp run lint:slow` and `vp run typecheck` inside the pre-commit gate and
# prints one summary line per invocation.
summary_from_output() {
  local file="$1" lines=""
  if [ -n "$file" ] && [ -f "$file" ]; then
    lines=$(grep -oE 'vp run: [0-9]+/[0-9]+ cache hit \([0-9]+%\)(, [0-9.]+s saved)?' "$file")
  fi
  if [ -z "$lines" ]; then
    echo 'null'
    return
  fi
  printf '%s\n' "$lines" |
    sed -E 's#vp run: ([0-9]+)/([0-9]+) cache hit \([0-9]+%\)(, ([0-9.]+)s saved)?#\1\t\2\t\4#' |
    awk -F'\t' 'NF { hits += $1; total += $2; saved += ($3 == "" ? 0 : $3 * 1000) }
      END { printf "{\"hits\":%d,\"total\":%d,\"saved_ms\":%d,\"runs\":%d}\n", hits, total, saved, NR }'
}

# Session working data with no lifetime bound of its own, so keep the tail
# rather than growing forever. One line is well under PIPE_BUF, so concurrent
# appends from parallel hooks stay whole.
MAX_LOG_BYTES=10000000
KEEP_LINES=20000

append() {
  mkdir -p "$LOG_DIR" || return 0
  printf '%s\n' "$1" >> "$LOG_FILE"
  local size
  size=$(stat -c %s "$LOG_FILE" 2>/dev/null || echo 0)
  if [ "$size" -gt "$MAX_LOG_BYTES" ]; then
    tail -n "$KEEP_LINES" "$LOG_FILE" > "$LOG_FILE.tmp" 2>/dev/null &&
      mv "$LOG_FILE.tmp" "$LOG_FILE"
  fi
}

cmd_record() {
  local source="" command="" exit_code=0 duration_ms=0 output_file="" files="" tool_use_id="" label="" ts_epoch_ms="" unresolved=""
  while [ $# -gt 0 ]; do
    case "$1" in
      --source) source="$2"; shift 2 ;;
      --command) command="$2"; shift 2 ;;
      --exit) exit_code="$2"; shift 2 ;;
      --duration-ms) duration_ms="$2"; shift 2 ;;
      --output-file) output_file="$2"; shift 2 ;;
      --files) files="$2"; shift 2 ;;
      --tool-use-id) tool_use_id="$2"; shift 2 ;;
      --label) label="$2"; shift 2 ;;
      --ts-epoch-ms) ts_epoch_ms="$2"; shift 2 ;;
      --unresolved) unresolved="$2"; shift 2 ;;
      *) shift ;;
    esac
  done
  is_self "$command" && return 0

  local tasks='null' cache='null'
  cache=$(summary_from_output "$output_file")
  # A swept record has no output of its own, and `--last-details` describes
  # whatever ran most recently — not this command. Leave both null rather than
  # attribute another run's cache numbers to it.
  if [ -n "$unresolved" ]; then
    cache='null'
  else
    case "$command" in
      *"vp run"*)
      # Canonical task names live only in `--last-details`, and it describes
      # exactly one `vp run` — so it is trustworthy only for a command that was
      # itself one. A `git commit` keeps the summed summary lines instead.
        tasks=$(last_details_tasks) || tasks='null'
        [ -z "$tasks" ] && tasks='null'
        if [ "$cache" = "null" ] && [ "$tasks" != "null" ]; then
          cache=$(printf '%s' "$tasks" | jq -c '{hits: (map(select(.cache == "hit")) | length),
            total: length, saved_ms: (map(.saved_ms) | add // 0), runs: 1}')
        fi
        ;;
    esac
  fi

  local record
  # A swept record is written long after the fact; back-date it to when the
  # command started so the timeline still orders by execution.
  local epoch_ms="${ts_epoch_ms:-$(now_ms)}"
  record=$(jq -nc \
    --arg ts "$(date -Iseconds -d "@$(( epoch_ms / 1000 ))")" \
    --argjson epoch_ms "$epoch_ms" \
    --arg source "$source" \
    --arg unresolved "$unresolved" \
    --arg label "$label" \
    --arg command "$command" \
    --argjson exit "${exit_code:-null}" \
    --argjson duration_ms "$duration_ms" \
    --arg cwd "$PWD" \
    --arg branch "$(git -C "$ROOT" branch --show-current 2>/dev/null)" \
    --arg tree "$(tree_fingerprint)" \
    --arg session "${CLAUDE_SESSION_ID:-}" \
    --arg tool_use_id "$tool_use_id" \
    --arg files "$files" \
    --argjson tasks "${tasks:-null}" \
    --argjson cache "${cache:-null}" \
    '{kind: "run", ts: $ts, epoch_ms: $epoch_ms, source: $source, command: $command,
      exit: $exit, duration_ms: $duration_ms, cwd: $cwd, branch: $branch, tree: $tree,
      session: $session, tool_use_id: $tool_use_id, cache: $cache, tasks: $tasks}
     | if $label == "" then . else . + {label: $label} end
     | if $unresolved == "" then . else . + {unresolved: $unresolved} end
     | if $files == "" then . else . + {files: ($files | split(" "))} end') || return 0
  append "$record"
}

cmd_run() {
  local source="" files="" label=""
  while [ $# -gt 0 ]; do
    case "$1" in
      --source) source="$2"; shift 2 ;;
      --files) files="$2"; shift 2 ;;
      --label) label="$2"; shift 2 ;;
      --) shift; break ;;
      *) shift ;;
    esac
  done
  [ $# -eq 0 ] && return 0

  local out start code
  out=$(mktemp "${TMPDIR:-/tmp}/verify-log.XXXXXX")
  start=$(now_ms)
  "$@" > >(tee -a "$out") 2> >(tee -a "$out" >&2)
  code=$?
  wait
  cmd_record --source "$source" --label "$label" --command "$*" --exit "$code" \
    --duration-ms "$(( $(now_ms) - start ))" --output-file "$out" --files "$files"
  unlink "$out" 2>/dev/null
  return "$code"
}

cmd_event() {
  local source="" event="" message="" record
  while [ $# -gt 0 ]; do
    case "$1" in
      --source) source="$2"; shift 2 ;;
      --event) event="$2"; shift 2 ;;
      --message) message="$2"; shift 2 ;;
      *) shift ;;
    esac
  done
  record=$(jq -nc \
    --arg ts "$(date -Iseconds)" \
    --argjson epoch_ms "$(now_ms)" \
    --arg source "${source:-agent}" \
    --arg event "$event" \
    --arg message "$message" \
    --arg branch "$(git -C "$ROOT" branch --show-current 2>/dev/null)" \
    --arg tree "$(tree_fingerprint)" \
    --arg session "${CLAUDE_SESSION_ID:-}" \
    '{kind: "event", ts: $ts, epoch_ms: $epoch_ms, source: $source, event: $event,
      message: $message, branch: $branch, tree: $tree, session: $session}') || return 0
  append "$record"
}

case "${1:-}" in
  run) shift; cmd_run "$@" ;;
  record) shift; cmd_record "$@" ;;
  event) shift; cmd_event "$@" ;;
  path) echo "$LOG_FILE" ;;
  is-self) shift; is_self "${1:-}" ;;
  *) echo "usage: verify-log.sh {run|record|event|path} ..." >&2; exit 64 ;;
esac
