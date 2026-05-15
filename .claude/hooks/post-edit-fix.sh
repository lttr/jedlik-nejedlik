#!/usr/bin/env bash
# PostToolUse(Edit|MultiEdit|Write) hook — autofix lint on the just-written file.
#
# Lint-only (`vp lint --fix`), not full `vp check --fix`: format is already
# handled by the global ~/dotfiles/claude/hooks/format-code.sh which runs
# `vp fmt --write` on the same matchers. Running format twice doubles the
# wall-time per edit (~1.4s vs ~0.5s) and lets two autofixers fight.
#
# Silent: errors swallowed, exit 0. Surfacing un-autofixable lint to Claude
# is the Stop hook's job (see stop-smart.sh).

f=$(jq -r '.tool_input.file_path // empty')
[ -z "$f" ] && exit 0
[ ! -f "$f" ] && exit 0

vp lint --fix "$f" 2>/dev/null || true
