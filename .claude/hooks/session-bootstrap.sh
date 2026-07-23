#!/usr/bin/env bash
# SessionStart hook: install deps on a fresh checkout (node_modules absent).
cd "$(git rev-parse --show-toplevel)" || exit 0
[ -d node_modules ] || pnpm install
