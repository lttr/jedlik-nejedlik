#!/usr/bin/env bash
# Stop hook — lint changed files, fail-fast (exit 2 + stderr → agent self-heals).
#
# Layered with PostToolUse `vp lint --fix` (silent per-write autofix).
# This hook surfaces what autofix couldn't fix, in batch at end of turn.
# Typecheck NOT here — too slow (~5s, vue-tsc can't narrow); pre-commit handles it.

set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

mapfile -t changed < <(
  { git diff --name-only HEAD 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | sort -u
)

[ ${#changed[@]} -eq 0 ] && exit 0

# oxlint runs at workspace root; eslint config lives only in web/, so eslint
# gets a filtered subset with the web/ prefix stripped.
code_files=()
eslint_rel=()

for f in "${changed[@]}"; do
  [ -f "$f" ] || continue   # skip deletions
  case "$f" in
    *.ts|*.tsx|*.mts|*.cts|*.js|*.mjs|*.cjs|*.vue) ;;
    *) continue ;;
  esac
  code_files+=("$f")
  case "$f" in web/*) eslint_rel+=("${f#web/}") ;; esac
done

[ ${#code_files[@]} -eq 0 ] && exit 0

run_step() {
  local name="$1"; shift
  local out
  if ! out=$("$@" 2>&1); then
    {
      echo "=== Stop hook: $name failed ==="
      echo "$out" | tail -50
      echo "=== ($name — fix above, or run \`vp lint --fix <file>\`) ==="
    } >&2
    exit 2
  fi
}

run_step "oxlint" vp lint "${code_files[@]}"

if [ ${#eslint_rel[@]} -gt 0 ]; then
  run_step "eslint" bash -c 'cd web && pnpm exec eslint "$@"' _ "${eslint_rel[@]}"
fi

exit 0
