#!/usr/bin/env bash
# SessionStart hook: install workspace deps when entering a git worktree.
# Skip the main checkout (--git-dir == --git-common-dir there; they differ in a worktree).

[ "$(git rev-parse --git-common-dir)" = "$(git rev-parse --git-dir)" ] && exit 0

cd "$(git rev-parse --show-toplevel)"
pnpm install
