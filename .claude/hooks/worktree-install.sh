#!/usr/bin/env bash
# SessionStart hook: install web/ deps when session starts in a git worktree.
#
# Skip in the main checkout — deps usually present, install is a manual concern.
# Detect worktree: in main, --git-dir == --git-common-dir; in a worktree they differ
# (--git-dir points to .git/worktrees/<name>, --git-common-dir to the shared .git).
set -euo pipefail

if [ "$(git rev-parse --git-common-dir)" = "$(git rev-parse --git-dir)" ]; then
  exit 0
fi

# Install at workspace root (pnpm-workspace.yaml lives there); installs web/ too.
# Skip when node_modules is already in sync with the lockfile — pnpm's own
# no-op detection still walks the workspace (~14s); mtime check is ~1ms.
# --frozen-lockfile: loud failure on drift (forces a deliberate `pnpm install`
# instead of silently mutating the lockfile).
root="$(git rev-parse --show-toplevel)"
marker="$root/node_modules/.modules.yaml"
lock="$root/pnpm-lock.yaml"
if [ -f "$marker" ] && [ "$marker" -nt "$lock" ]; then
  exit 0
fi

cd "$root"
pnpm install --frozen-lockfile
