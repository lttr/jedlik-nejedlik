# CLAUDE.md

Educational website "Jedlík-nejedlík" (nutrition/parenting). Nuxt 4 frontend in `web/`, Directus CMS at `https://obsah-jedlika.lttr.cz`, deployed on Coolify (Nixpacks, auto-deploy on push to `master`). Czech locale, site `https://www.jedlik-nejedlik.cz`.

## Verification

Three separate buckets — none replaces the others:

- **Static correctness** — `vp run check:all` is the only run that counts as checks passing; nothing ships on a subset. It covers `lint`, `slowlint`, `typecheck`, `fallow`, `test`, `build`; caching makes repeats free and every task is quiet on success, so run it bare. Running an underlying tool directly is fine for debugging or `--fix`, it just never counts.
- **Behaviour** — the `verify` skill: run the real app, drive the changed flow, screenshot it and look at the image. Catches what only shows at runtime (hydration mismatch, null data, layout broken at 375px). A green `check:all` does not verify behaviour.
- **Code quality** — `/code-review`, `/simplify`; judgement calls, not checks.

Verification commands are auto-logged by hooks to a scratch JSONL outside the repo; read it with `scripts/verify-log-report.sh`. See `docs/verify-log.md`.

## Non-obvious

- Toolchain is Vite+ (`vp`). Build with `vp run build`, never `vp build` (raw Vite, no `index.html` entry). Running/driving the dev server: see the `run-jedlik-nejedlik` skill.
- The `rolldown` pin in `web/` is exact and load-bearing — never widen or remove it (skew against vite-plus's bundled copy breaks `vp`). Details in the `dependency-update` skill.
- Git hooks are part of the gate: pre-commit runs every `check:all` task except `build`, which gates pre-push. Both hooks are commented — read `.vite-hooks/pre-commit`.
- `vp staged` auto-formats and `--fix`es staged files, enforcing oxlint (stricter than eslint). It is scoped to the index because it _writes_ — it must not reformat files you did not stage; the repo-wide oxlint gate is the separate `check:lint` next to it. Don't pre-run a linter by name to "verify" — commit and fix what the hook reports. After `git commit`, re-Read any file you still hold in context.
- Env vars always come from the environment (web env config; local `web/.env`), never from a hook or generated file. `NUXT_PUBLIC_DIRECTUS_URL` missing → dev 500s; ask the user for the value, don't invent one.
- Never grep barrel `.d.ts` files in `node_modules`; read the specific declaration.
- Answer Directus permission questions from the committed dump (`directus/config/collections/permissions.json`), not the live API; its records are keyed by `_syncId`, not the live id. See `docs/directus.md`.
