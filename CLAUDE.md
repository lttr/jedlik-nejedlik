# CLAUDE.md

Educational website "Jedlík-nejedlík" (nutrition/parenting). Nuxt 4 frontend in `web/`, Directus CMS at `https://obsah-jedlika.lttr.cz`, deployed on Coolify (Nixpacks, auto-deploy on push to `master`). Czech locale, site `https://www.jedlik-nejedlik.cz`.

## Verification

- `vp run verify:all` is the gate: only a green run of it counts as verified, and nothing ships on a subset (it covers `check`, `slowlint`, `typecheck`, `fallow`, `test`, `build` — caching makes repeats free). Running an underlying tool directly is fine for debugging or `--fix`; it just never counts as verification.
- Never pipe a check through `head` / `tail` / `grep`. Run it bare — piping swallows the exit code the harness would report.
- If you curl an endpoint twice to prove behaviour, promote the proof to a probe or unit test (`web/tests/unit/`) before the ticket closes.
- Verification commands are auto-logged by hooks to a scratch JSONL outside the repo; read it with `scripts/verify-log-report.sh`. See `docs/verify-log.md`.
- Changes touching `directus/config/**` or `web/server/**` need a fresh `vp run directus:probe` before commit (pre-commit gate checks the stamp).

## Non-obvious

- Toolchain is Vite+ (`vp`). Build with `vp run build`, never `vp build` (raw Vite, no `index.html` entry). Running/driving the dev server: see the `run-jedlik-nejedlik` skill.
- The `rolldown` pin in `web/` is exact and load-bearing — never widen or remove it (skew against vite-plus's bundled copy breaks `vp`). Details in the `dependency-update` skill.
- Pre-commit hook (`vp staged`) auto-formats and `--fix`es staged files, enforcing oxlint (stricter than eslint). Don't pre-run a linter by name to "verify" — commit and fix what the hook reports. After `git commit`, re-Read any file you still hold in context.
- Env vars always come from the environment (web env config; local `web/.env`), never from a hook or generated file. `NUXT_PUBLIC_DIRECTUS_URL` missing → dev 500s; ask the user for the value, don't invent one.
- Never grep barrel `.d.ts` files in `node_modules`; read the specific declaration.
- Answer Directus permission questions from the committed dump (`directus/config/collections/permissions.json`), not the live API; its records are keyed by `_syncId`, not the live id. See `docs/directus.md`.
