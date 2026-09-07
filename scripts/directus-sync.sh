#!/usr/bin/env bash
# Run a directus-sync command (`pull` or `diff`) against the production
# instance, resolving the admin token itself so `vp run directus:pull` works
# without a hand-typed prefix (see docs/directus.md).
#
# Token resolution, first hit wins:
#   1. DIRECTUS_TOKEN already exported in the shell (CI, one-off overrides)
#   2. DIRECTUS_TOKEN in web/.env
#   3. DIRECTUS_PROBE_ADMIN_TOKEN in web/.env — documented as the same MCP
#      credential, so the repo needs only one copy of it
# Nothing found is a hard error with instructions, never a fallback to
# directus-sync's interactive email/password auth.
set -euo pipefail

CMD="${1:-}"
case "$CMD" in
  pull | diff) ;;
  *)
    echo "usage: $(basename "$0") <pull|diff>" >&2
    exit 2
    ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# `set -a` exports what the file defines; the subshell keeps it from leaking
# the probe tokens into directus-sync's environment beyond the one we pick.
if [[ -z "${DIRECTUS_TOKEN:-}" && -f web/.env ]]; then
  DIRECTUS_TOKEN="$(
    set -a
    # shellcheck disable=SC1091
    . web/.env
    set +a
    echo "${DIRECTUS_TOKEN:-${DIRECTUS_PROBE_ADMIN_TOKEN:-}}"
  )"
fi

if [[ -z "${DIRECTUS_TOKEN:-}" ]]; then
  cat >&2 <<'MSG'
No Directus admin token found.

directus-sync needs an admin-capable static token. Set one of these in
web/.env (gitignored), or export DIRECTUS_TOKEN for a single run:

  DIRECTUS_TOKEN=<admin-token>
  DIRECTUS_PROBE_ADMIN_TOKEN=<admin-token>   # same credential, shared with the probes

Where to get it: it is the token behind the Directus MCP server — a Claude Code
session can print it with `claude mcp get directus`. Otherwise mint one in the
admin app under User Directory -> the MCP user -> Token.
MSG
  exit 1
fi

export DIRECTUS_TOKEN
# Pinned exactly in root package.json; call the local bin, not a resolver.
exec node_modules/.bin/directus-sync -c directus/sync.config.cjs "$CMD"
