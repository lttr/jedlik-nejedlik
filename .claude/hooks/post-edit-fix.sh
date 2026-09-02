#!/usr/bin/env bash
# PostToolUse(Edit|MultiEdit|Write) — silent lint autofix on the written file.
# Format is the global format-code.sh hook's job; un-autofixable lint is the
# pre-commit gate's.

f=$(jq -r '.tool_input.file_path // empty')
[ -z "$f" ] && exit 0
[ ! -f "$f" ] && exit 0

# Files in another project do not get this repo's lint config.
root=$(cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" && pwd -P)
abs=$(cd "$(dirname "$f")" 2>/dev/null && printf '%s/%s' "$(pwd -P)" "$(basename "$f")")
case "$abs" in "$root"/*) ;; *) exit 0 ;; esac

# stdout too: `vp lint` prints a summary that would land in the transcript.
vp lint --fix "$abs" >/dev/null 2>&1
exit 0
