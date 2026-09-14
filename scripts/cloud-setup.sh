#!/usr/bin/env bash
# Set up a fresh Claude Code web (cloud) container for this repo.
# Dependencies are installed by the SessionStart hook, not here.
set -euo pipefail

# Vite+ toolchain (vp, vpx). The installer adds its bin dir to ~/.bashrc for
# later sessions; this script needs it on PATH now.
curl -fsSL https://vite.plus | bash
export PATH="$HOME/.local/share/vite-plus/bin:$PATH"

# playwright-cli (vp global) drives the browser for the run/verify skills.
# Its default browser is the system Chrome, which the container lacks;
# browserName "chromium" without a channel selects Playwright's own build.
# chromiumSandbox off: the container runs as root, and Chromium refuses to
# start its sandbox as root.
vp install -g @playwright/cli
mkdir -p ~/.playwright
cat > ~/.playwright/cli.config.json <<JSON
{ "outputDir": "$HOME/.playwright/output", "browser": { "browserName": "chromium", "launchOptions": { "chromiumSandbox": false } } }
JSON
playwright-cli install-browser chromium

# Claude Code plugins enabled in .claude/settings.json.
claude plugin marketplace add lttr/claude-marketplace
claude plugin install aiwork@lttr-claude-marketplace
claude plugin install browser@lttr-claude-marketplace
claude plugin install writing@lttr-claude-marketplace
