#!/usr/bin/env bash
# Run the Directus permission probes and, on success, stamp
# .directus-probe-stamp (gitignored). The pre-commit probe gate
# (check-probe-stamp.sh) requires a stamp newer than any staged
# permission-touching file.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/web"
vp test run --config vitest.probes.config.ts
touch "$ROOT/.directus-probe-stamp"
