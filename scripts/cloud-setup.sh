#!/usr/bin/env bash
# Set up a Claude Code web (cloud) container for this repo. Safe to re-run.
# Dependencies are installed by the SessionStart hook, not here.
set -euo pipefail

# Vite+ toolchain (vp, vpx). The installer adds its bin dir to ~/.bashrc; new
# sessions get it from there, this one needs it on PATH now. Both layouts: the
# current split one (~/.local/share) and the older monolithic ~/.vite-plus.
export PATH="$HOME/.local/share/vite-plus/bin:$HOME/.vite-plus/bin:$PATH"
command -v vp >/dev/null || curl -fsSL https://vite.plus | bash

# playwright-cli (vp global) drives the browser for the run/verify skills.
# Its default browser is the system Chrome, which the container lacks;
# browserName "chromium" without a channel selects Playwright's own build.
command -v playwright-cli >/dev/null || vp install -g @playwright/cli
mkdir -p ~/.playwright
[ -f ~/.playwright/cli.config.json ] || cat > ~/.playwright/cli.config.json <<JSON
{ "outputDir": "$HOME/.playwright/output", "browser": { "browserName": "chromium" } }
JSON
playwright-cli install-browser chromium

# Claude Code plugins enabled in .claude/settings.json.
claude plugin marketplace add lttr/claude-marketplace
claude plugin install aiwork@lttr-claude-marketplace
claude plugin install browser@lttr-claude-marketplace
claude plugin install writing@lttr-claude-marketplace
