---
status: done
blocked_by: []
references:
  - "Spec: ../spec.md (gotchas 3 and 5)"
---

# 01 — Pre-flight the out-of-repo surfaces

**What to build:** certainty that the two surfaces the upgrade touches outside version control are safe before any pin moves. vite-plus 0.2.8 renamed three environment variables with no aliases and no error on the old names, and 0.3.0 relocates fresh installs to XDG base directories. The repo itself is already clean of the old names; the Coolify environment, the local shell profile and the Nixpacks install path are not covered by that grep.

A hit here changes the shape of the upgrade ticket, so it runs first and costs almost nothing.

## Acceptance criteria

- [x] Coolify environment for `jedlik-nejedlik-production` checked for `VITE_LOG`, `VITE_GLOBAL_CLI_JS_SCRIPTS_DIR` and `VITE_UPDATE_TASK_TYPES`; any hit renamed to its `VP_` form
- [x] Local shell profile checked for the same three names
- [x] Confirmed the Nixpacks build installs vite-plus through pnpm and never reads a hard-coded `~/.vite-plus` path, so the XDG relocation cannot reach the deploy
- [x] Findings recorded in `../notes.md`, including the negative results — a future session should not have to repeat this
