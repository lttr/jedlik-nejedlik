#!/usr/bin/env bash
# Run directus-sync (`pull` or `diff`) against the production instance with the
# admin token from DIRECTUS_PROBE_ADMIN_TOKEN, taken from the shell or web/.env.
# The probes use the same token, so the repo keeps one copy. directus-sync reads
# it as DIRECTUS_TOKEN, hence the re-export at the end. No token is an error with
# instructions, never a fallback to directus-sync's interactive login.
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

# Read it in a subshell so the rest of web/.env stays out of the environment.
if [[ -z "${DIRECTUS_PROBE_ADMIN_TOKEN:-}" && -f web/.env ]]; then
  DIRECTUS_PROBE_ADMIN_TOKEN="$(
    set -a
    # shellcheck disable=SC1091
    . web/.env
    set +a
    echo "${DIRECTUS_PROBE_ADMIN_TOKEN:-}"
  )"
fi

if [[ -z "${DIRECTUS_PROBE_ADMIN_TOKEN:-}" ]]; then
  cat >&2 <<'MSG'
No Directus admin token found.

directus-sync needs an admin-capable static token. Set it in web/.env
(gitignored); the permission probes use the same one:

  DIRECTUS_PROBE_ADMIN_TOKEN=<admin-token>

Where to get it: it is the token behind the Directus MCP server — a Claude Code
session can print it with `claude mcp get directus`. Otherwise mint one in the
admin app ($NUXT_PUBLIC_DIRECTUS_URL/admin) under User Directory -> the MCP
user -> Token.
MSG
  exit 1
fi

export DIRECTUS_TOKEN="$DIRECTUS_PROBE_ADMIN_TOKEN"
# Pinned exactly in root package.json; call the local bin, not a resolver.
exec node_modules/.bin/directus-sync -c directus/sync.config.cjs "$CMD"
