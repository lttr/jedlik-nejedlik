#!/usr/bin/env bash
# Stop hook — scope lint to changed files, fail-fast.
# Silent on success. Exit 2 with truncated stderr on fail (agent self-heals).
#
# Scope source: `git diff --name-only HEAD` plus untracked files, deduped. Empty → exit 0 fast.
# Chain: oxlint → eslint. First failure stops.
# Typecheck: NOT run here — too slow (~5.3s, vue-tsc can't narrow). Pre-commit handles it.
# Tests: not wired — see TESTS section at bottom for how to add once vitest exists.

set -u

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

# Collect changed files (tracked diff vs HEAD + untracked, deduped)
mapfile -t changed < <(
  { git diff --name-only HEAD 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | sort -u
)

[ ${#changed[@]} -eq 0 ] && exit 0

code_files=()
web_files=()

for f in "${changed[@]}"; do
  [ -f "$f" ] || continue   # skip deletions
  case "$f" in
    *.ts|*.tsx|*.mts|*.cts|*.js|*.mjs|*.cjs|*.vue)
      code_files+=("$f") ;;
  esac
  case "$f" in web/*) web_files+=("$f") ;; esac
done

[ ${#code_files[@]} -eq 0 ] && exit 0

run_step() {
  local name="$1"; shift
  local out
  if ! out=$("$@" 2>&1); then
    {
      echo "=== Stop hook: $name failed ==="
      echo "$out" | tail -50
      echo "=== ($name — fix above, or run \`vp lint --fix <file>\` for mechanical lints) ==="
    } >&2
    exit 2
  fi
}

# 1. oxlint — changed code files only (~50ms/file, Rust)
if [ ${#code_files[@]} -gt 0 ]; then
  run_step "oxlint" vp lint "${code_files[@]}"
fi

# 2. eslint — changed web/ files only (eslint config in web/)
eslint_rel=()
for f in "${web_files[@]}"; do
  case "$f" in
    *.ts|*.tsx|*.mts|*.cts|*.js|*.mjs|*.cjs|*.vue)
      eslint_rel+=("${f#web/}") ;;
  esac
done
if [ ${#eslint_rel[@]} -gt 0 ]; then
  run_step "eslint" bash -c "cd web && pnpm exec eslint $(printf '%q ' "${eslint_rel[@]}")"
fi

# Typecheck intentionally NOT here. ~5.3s, vue-tsc can't narrow per-file.
# Pre-commit (.vite-hooks/pre-commit) runs `vp run typecheck`. Agent runs `vp run verify` on demand.

# === TESTS — not wired yet ===
# Once vitest is added to web/, append:
#   if [ -f web/vitest.config.ts ] || grep -q '"vitest"' web/package.json 2>/dev/null; then
#     run_step "tests" bash -c "cd web && pnpm exec vitest --run --changed"
#   fi
# Note: vitest's --changed flag reads git diff itself, so no file list needed.
# Budget: keep test suite under ~3s warm or move to tier 3 (pre-commit) instead.

exit 0
