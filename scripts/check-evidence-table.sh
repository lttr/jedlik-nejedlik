#!/usr/bin/env bash
# On-demand check — the "Verification evidence" table in changed .aiwork
# specs. Any evidence row with an empty Value cell → fail, so real evidence
# or an explicit "n/a: why" is filled in before shipping. Not enforced by
# any hook; the implement-spec-to-pr skill runs it before the final report.
# Specs without the table (research, triage, older work) are ignored.

set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 0

mapfile -t specs < <(
  { git diff --name-only HEAD 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | sort -u | grep -E '^\.aiwork/.*/spec\.md$'
)

[ ${#specs[@]} -eq 0 ] && exit 0

problems=()
for spec in "${specs[@]}"; do
  [ -f "$spec" ] || continue
  grep -qi "verification evidence" "$spec" || continue
  # Evidence rows: "| Label | Value |". Empty/whitespace Value cell = unfilled.
  while IFS= read -r line; do
    problems+=("$spec: $line")
  done < <(grep -E '^\|\s*(Tests|Probe run|Screenshots)\s*\|\s*\|?\s*$' "$spec")
done

[ ${#problems[@]} -eq 0 ] && exit 0

{
  echo "evidence check: verification evidence table incomplete."
  printf '  %s\n' "${problems[@]}"
  echo "Fill each Value cell with real evidence (paths, timestamp) or an explicit \"n/a: <why>\"."
} >&2
exit 1
