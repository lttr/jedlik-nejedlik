#!/usr/bin/env bash
# PostToolUse(Edit|MultiEdit|Write) — silent lint autofix on the written file.
# Format is the global format-code.sh hook's job; un-autofixable lint is
# stop-smart.sh's.

f=$(jq -r '.tool_input.file_path // empty')
[ -z "$f" ] && exit 0
[ ! -f "$f" ] && exit 0

# stdout too: `vp lint` prints a summary that would land in the transcript.
vp lint --fix "$f" >/dev/null 2>&1 || true
