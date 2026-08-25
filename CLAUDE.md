# CLAUDE.md

Educational website "Jedlík-nejedlík" (nutrition/parenting). Nuxt 4 frontend in `web/`, Directus CMS at `https://obsah-jedlika.lttr.cz`, deployed on Coolify (Nixpacks, auto-deploy on push to `master`). Czech locale, site `https://www.jedlik-nejedlik.cz`.

## Verification

- Never run `verify:check` / `verify:lint` / `verify:typecheck` / `verify:test` / `verify:build` (or their underlying tools) standalone. `vp run verify:all` is the only verification command — caching makes repeats free.
- Never pipe a check through `head` / `tail` / `grep`. Run it bare — piping swallows the exit code the harness would report, forcing a full re-run just to recover it.
- Kill dev servers by port (stored PID or `fuser -k <port>/tcp`), never by pattern — `pkill -f "nuxi dev"` matches your own shell command line.
- If you curl an endpoint twice to prove behaviour, promote the proof to a probe or unit test (`web/tests/unit/`) before the ticket closes — otherwise the finding lives only in the transcript and is lost to future sessions.
- Changes touching `directus/config/**` or `web/server/**` need a fresh `vp run directus:probe` before commit (pre-commit gate checks the stamp).

## Non-obvious

- SVGs in `web/app/assets/svgs/` auto-import as Vue components (via `nuxt-svgo`) — don't wrap in icon component.
- Plausible analytics ignores `localhost` and `jedlik-nejedlik-test.lttr.cz`; custom host `plausible.lttr.cz`.
- Toolchain is Vite+ (`vp`). `vp build` does NOT work — runs raw Vite which has no `index.html` entry. Use `vp run build` (= `pnpm -r run build` → `nuxi build`).
- `rolldown` is an explicit `web/` devDependency because `@nuxt/vite-builder` imports it directly when vite is aliased to `vite-plus-core` via the catalog override. Remove once Nuxt vite-builder ships vite-plus compat.
- Pre-commit hook (`vp staged`) auto-formats and `--fix`es staged files, enforcing oxlint (stricter than eslint). Don't pre-run a linter by name to "verify" — commit and fix what the hook reports. After `git commit`, re-Read any file you still hold in context — on-disk contents may have changed.
- `session-bootstrap.sh` SessionStart hook runs `pnpm install` when `node_modules` is missing. Env vars are always supplied by the environment (web env config; local `web/.env`), never by the hook or by a generated file. `NUXT_PUBLIC_DIRECTUS_URL` missing → dev 500s; ask the user for the value, don't invent or scaffold one.
- To drive the dev server with a browser use `pnpm dev:agent`: sets `NUXT_NO_WS=1` to drop the HMR socket (vite-plus 0.2.5 double-upgrades it and crashes on connect). Page still SSRs; human `pnpm dev` keeps HMR. See the `run-jedlik-nejedlik` skill.
- oxlint does not type-check `.vue` files yet — only eslint and `nuxi typecheck` cover SFCs.
- Never grep barrel `.d.ts` files in `node_modules`; read the specific declaration.
- Answer Directus permission questions from the committed dump (`directus/config/collections/permissions.json`), not the live API — same data, and the API route is often blocked. Its records are keyed by `_syncId`, which is NOT the live id; look ids up on the instance before any `PATCH`. See `docs/directus.md`.
