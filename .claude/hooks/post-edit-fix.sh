#!/usr/bin/env bash
# PostToolUse(Edit|MultiEdit|Write) — silent lint autofix on the written file.
# Format is the global format-code.sh hook's job; un-autofixable lint is
# stop-smart.sh's.

payload=$(cat)
f=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')
session=$(printf '%s' "$payload" | jq -r '.session_id // empty')
[ -z "$f" ] && exit 0
[ ! -f "$f" ] && exit 0

# Files in another project get neither this repo's lint config nor its log.
root=$(cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" && pwd -P)
abs=$(cd "$(dirname "$f")" 2>/dev/null && printf '%s/%s' "$(pwd -P)" "$(basename "$f")")
case "$abs" in "$root"/*) ;; *) exit 0 ;; esac

# stdout too: `vp lint` prints a summary that would land in the transcript.
start=$(date +%s%3N)
out=$(vp lint --fix "$abs" 2>&1)
code=$?

# `vp lint` exits 1 on a path it doesn't lint at all (.md, .json, .yaml, .sh).
# That is a no-op, not a failure — logging it would make the log's failure
# count meaningless.
case "$out" in
  *"No files found to lint"*) exit 0 ;;
esac

CLAUDE_SESSION_ID="$session" \
  bash "$root/scripts/verify-log.sh" record \
  --source post-edit-hook --command "vp lint --fix $abs" --exit "$code" \
  --duration-ms "$(( $(date +%s%3N) - start ))" --files "$abs" >/dev/null 2>&1

exit 0
