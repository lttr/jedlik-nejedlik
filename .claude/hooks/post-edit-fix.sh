#!/usr/bin/env bash
# PostToolUse(Edit|MultiEdit|Write) — silent lint autofix on the written file.
# Format is the global format-code.sh hook's job; un-autofixable lint is
# stop-smart.sh's.

payload=$(cat)
f=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')
session=$(printf '%s' "$payload" | jq -r '.session_id // empty')
[ -z "$f" ] && exit 0
[ ! -f "$f" ] && exit 0

# stdout too: `vp lint` prints a summary that would land in the transcript.
start=$(date +%s%3N)
vp lint --fix "$f" >/dev/null 2>&1
code=$?

CLAUDE_SESSION_ID="$session" \
  bash "${CLAUDE_PROJECT_DIR:-$(pwd)}/scripts/verify-log.sh" record \
  --source post-edit-hook --command "vp lint --fix $f" --exit "$code" \
  --duration-ms "$(( $(date +%s%3N) - start ))" --files "$f" >/dev/null 2>&1

exit 0
