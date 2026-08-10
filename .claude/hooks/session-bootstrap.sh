#!/usr/bin/env bash
# SessionStart hook: install deps on a fresh checkout (node_modules absent).
cd "$(git rev-parse --show-toplevel)" || exit 0
[ -d node_modules ] || pnpm install

# Nuxt reads NUXT_PUBLIC_DIRECTUS_URL from web/.env, which is gitignored and so
# absent on a fresh checkout. Subprocesses that get their own environment (the
# `nuxi dev` the pre-commit smoke test spawns) then fail runtime-config
# validation and every page 500s. Materialise the file from the environment.
if [ -n "${NUXT_PUBLIC_DIRECTUS_URL:-}" ] && [ ! -f web/.env ]; then
  printf 'NUXT_PUBLIC_DIRECTUS_URL=%s\n' "$NUXT_PUBLIC_DIRECTUS_URL" > web/.env
fi
