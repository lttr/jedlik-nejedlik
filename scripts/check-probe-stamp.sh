#!/usr/bin/env bash
# Pre-commit probe gate: when permission-touching paths are staged
# (directus/config/** or web/server/**), require a Directus probe run
# (`vp run directus:probe`) fresher than the newest staged file in those
# paths. The probe stamps .directus-probe-stamp via directus-probe.sh.
set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 0

mapfile -t gated < <(git diff --cached --name-only -- "directus/config" "web/server")
[ ${#gated[@]} -eq 0 ] && exit 0

STAMP=".directus-probe-stamp"
fail() {
  {
    echo "probe gate: staged permission-touching files require a fresh probe run."
    printf '  %s\n' "${gated[@]}"
    echo "Run \`vp run directus:probe\` and commit again."
  } >&2
  exit 1
}

[ -f "$STAMP" ] || fail

stamp_time=$(stat -c %Y "$STAMP")
for f in "${gated[@]}"; do
  [ -f "$f" ] || continue # deletions have no mtime; the stamp-exists check covers them
  if [ "$(stat -c %Y "$f")" -gt "$stamp_time" ]; then
    fail
  fi
done

exit 0
