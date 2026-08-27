#!/usr/bin/env bash
# Read the verification log written by scripts/verify-log.sh.
#
#   verify-log-report.sh [timeline|commands|tasks|redundant|summary] [filters]
#
# Filters: --session ID | --all | --branch NAME | --since ISO-DATE | --last N
# Default view is `summary`, over the newest session in the log — the file
# spans every session in this project, so `--all` is how you look wider. For
# anything not covered here, the log is plain JSONL — query it with jq.

set -uo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-$PWD}")
LOG_FILE="${VERIFY_LOG_FILE:-${TMPDIR:-/tmp}/verify-log-$(basename "$ROOT").jsonl}"

view="summary"
session=""
branch=""
since=""
last=""
all=""

while [ $# -gt 0 ]; do
  case "$1" in
    timeline|commands|tasks|redundant|summary) view="$1"; shift ;;
    --session) session="$2"; shift 2 ;;
    --all) all=1; shift ;;
    --branch) branch="$2"; shift 2 ;;
    --since) since="$2"; shift 2 ;;
    --last) last="$2"; shift 2 ;;
    --file) LOG_FILE="$2"; shift 2 ;;
    *) echo "unknown argument: $1" >&2; exit 64 ;;
  esac
done

if [ ! -f "$LOG_FILE" ]; then
  echo "no verification log yet: $LOG_FILE" >&2
  exit 1
fi

# Newest session by default: a log spanning days of sessions makes every
# "how many times did this run" answer meaningless.
if [ -z "$session" ] && [ -z "$all" ]; then
  session=$(jq -rs 'map(select(.session != null and .session != "")) | last | .session // ""' "$LOG_FILE")
fi

# One filtered JSON array on stdout, consumed by every view below.
records=$(jq -s \
  --arg session "$session" --arg branch "$branch" --arg since "$since" --arg last "$last" '
  map(select(($session == "" or .session == $session)
         and ($branch  == "" or .branch  == $branch)
         and ($since   == "" or .ts >= $since)))
  | sort_by(.epoch_ms)
  | if $last == "" then . else .[-($last | tonumber):] end' "$LOG_FILE")

case "$view" in
  timeline)
    printf '%s' "$records" | jq -r '.[] |
      if .kind == "event"
      then "\(.ts[11:19])  ·  \(.event)\(if .message == "" then "" else ": " + .message end)"
      else "\(.ts[11:19])  \(if .unresolved != null then "!   " elif .exit == 0 then "ok  " else "FAIL" end)  \(((.duration_ms // 0)/1000)|floor)s  [\(.source)]  \(.command)" +
           (if .cache == null then "" else "  (\(.cache.hits)/\(.cache.total) cached)" end)
      end'
    ;;
  commands)
    printf '%s' "$records" | jq -r '
      map(select(.kind == "run"))
      | group_by(.command)
      | map({command: .[0].command, runs: length,
             failed: (map(select(.exit != null and .exit != 0)) | length),
             unresolved: (map(select(.unresolved != null)) | length),
             seconds: ((map(.duration_ms // 0) | add // 0) / 1000 | floor)})
      | sort_by(-.runs)
      | (["RUNS", "FAILED", "UNRESOLVED", "SECONDS", "COMMAND"] | @tsv),
        (.[] | [.runs, .failed, .unresolved, .seconds, .command] | @tsv)' | column -t -s$'\t'
    ;;
  tasks)
    printf '%s' "$records" | jq -r '
      map(select(.kind == "run" and .tasks != null) | .tasks) | add // []
      | group_by(.name)
      | map({task: .[0].name, runs: length,
             hits: (map(select(.cache == "hit")) | length),
             misses: (map(select(.cache == "miss")) | length),
             saved_s: ((map(.saved_ms) | add // 0) / 1000 | floor)})
      | sort_by(-.runs)
      | (["RUNS", "HITS", "MISSES", "HIT%", "SAVED_S", "TASK"] | @tsv),
        (.[] | [.runs, .hits, .misses, ((.hits * 100 / .runs) | floor), .saved_s, .task] | @tsv)' |
      column -t -s$'\t'
    ;;
  redundant)
    # A run is redundant when the same command already ran against the exact
    # same working tree (same HEAD, same diff) — it could not have found
    # anything new. Cheap when fully cached, wasted wall time when not.
    printf '%s' "$records" | jq -r '
      map(select(.kind == "run"))
      | group_by([.command, .tree])
      | map(select(length > 1))
      | map({command: .[0].command, tree: .[0].tree, repeats: (length - 1),
             wasted_s: ((((map(.duration_ms // 0) | add) - (.[0].duration_ms // 0)) / 1000) | floor),
             at: map(.ts[11:19]) | join(" ")})
      | sort_by(-.wasted_s)
      | if length == 0 then "no repeated runs against an unchanged tree" else
        (["REPEATS", "WASTED_S", "TREE", "COMMAND", "AT"] | @tsv),
        (.[] | [.repeats, .wasted_s, .tree, .command, .at] | @tsv) end' | column -t -s$'\t'
    ;;
  summary)
    printf '%s' "$records" | jq -r '
      (map(select(.kind == "run"))) as $runs
      | ($runs | map(select(.tasks != null) | .tasks) | add // []) as $tasks
      | "runs:        \($runs | length) (\($runs | map(select(.exit != null and .exit != 0)) | length) failed, \($runs | map(select(.unresolved != null)) | length) unresolved)",
        "wall time:   \(($runs | map(.duration_ms // 0) | add // 0) / 1000 | floor)s",
        "tasks:       \($tasks | length) executions, \($tasks | map(select(.cache == "hit")) | length) cache hits",
        "cache saved: \(($tasks | map(.saved_ms) | add // 0) / 1000 | floor)s",
        "sources:     \($runs | group_by(.source) | map("\(.[0].source)=\(length)") | join(" "))",
        "repeats on unchanged tree: \($runs | group_by([.command, .tree]) | map(select(length > 1) | length - 1) | add // 0)",
        "events:      \(map(select(.kind == "event")) | length)",
        "session:     \($runs | last | .session // "-")"'
    ;;
esac
