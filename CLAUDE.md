# CLAUDE.md

Educational website "Jedlík-nejedlík" (nutrition/parenting). Nuxt 4 frontend in `web/`, Directus CMS at `NUXT_PUBLIC_DIRECTUS_URL` (`web/.env`), deployed on Coolify (Nixpacks, auto-deploy on push to `master`). Czech locale, site `https://www.jedlik-nejedlik.cz`.

## Verification

Three separate buckets — none replaces the others:

- **Static correctness** — `vp run check:all` is the only run that counts as checks passing; nothing ships on a subset. It covers `lint`, `slowlint`, `typecheck`, `fallow`, `test`; caching makes repeats free and every task is quiet on success, so run it bare. Running an underlying tool directly is fine for debugging or `--fix`, it just never counts.
- **Behaviour** — the `verify` skill: run the real app, drive the changed flow, screenshot it and look at the image. Catches what only shows at runtime (hydration mismatch, null data, layout broken at 375px). A green `check:all` does not verify behaviour.
- **Code quality** — `/code-review`, `/simplify`; judgement calls, not checks.

## Commits

Conventional Commits. The scope is a code area (`auth`, `consent`), never the branch. Subjects take a colon, not an em dash.

## Shipping

"Ship it" starts with the task folder: mark the spec `status: done` and commit it with the rest of the work.

Where it goes next depends on the branch. A branch that lives only on this machine is rebased onto `master`, `master` is fast-forwarded to it and pushed, and then the worktree and the branch are removed. A branch that is already pushed is shipped by pushing to it and opening a PR if it has none.

The push to `master` is what triggers the Coolify deploy. Watch it with the `monitor-deploy` skill and report the outcome.

## Imports and layers

- Our own composables, utils, `shared/`, `server/utils` and components are imported explicitly. Only Vue, Nuxt, h3, Nitro and module APIs are auto-imported. Siblings and one level up are relative; beyond that use `#layers/<name>/...` inside a layer (never `~/` there) and `~/`, `#shared/` or `#layers/<name>/` in the root.
- Layers import only down the stack `app → mock-gopay → shop → auth → directus → base` (fallow boundaries, an error). Run `fallow guard <file>` before an edit that crosses layers; code two layers share moves down, it does not get an allow-rule.
- After a fresh checkout run `vp run nuxt:prepare`: the `#layers/*` aliases and the remaining auto-import types live in `.nuxt/`.
- No component auto-import means no `<Lazy*>` prefix: lazy-load with `defineAsyncComponent(() => import("./Foo.vue"))`.

## Non-obvious

- Before writing or editing Czech copy in `web/app/`, call the Skill tool with `writing:czech-typography` (dashes, quotes, non-breaking spaces, units).
- Toolchain is Vite+ (`vp`). Build with `vp run build`, never `vp build` (raw Vite, no `index.html` entry). Running/driving the dev server: see the `run-jedlik-nejedlik` skill.
- Four exact pins move as one: `rolldown` and `vitest` in `web/`, the `vite`/`vite-plus` catalog rows. Never widen or split them — rolldown is vendored inside vite-plus-core, not npm-resolved, so only the pin keeps our copy matching the one `vp` runs. Why: `pnpm-workspace.yaml` under `catalog:`. Updates: `nuxt-deps-update` skill.
- The pre-commit hook is part of the gate: it runs `vp staged` and then `check:all` in full. The hook is commented — read `.vite-hooks/pre-commit`. The build is not a check; it runs on deploy (`vp run build` locally).
- The pre-commit hook runs `lint-comments --staged` before `check:all`: advisory, never blocks. It reads only JS/TS, CSS, `.vue` and `.html`, so a shell, Markdown or config commit is never graded and "No findings" there means nothing was looked at. Act on what it flags in a follow-up commit, because each comment is graded once, when you commit it. Never add `lint-comments: keep` markers. For a wider pass, use the `lint-comments` skill.
- `vp staged` auto-formats and `--fix`es staged files, enforcing oxlint (stricter than eslint). It is scoped to the index because it _writes_ — it must not reformat files you did not stage; the repo-wide oxlint gate is the separate `check:lint` next to it. Don't pre-run a linter by name to "verify" — commit and fix what the hook reports. After `git commit`, re-Read any file you still hold in context.
- Env vars always come from the environment (web env config; local `web/.env`), never from a hook or generated file. `NUXT_PUBLIC_DIRECTUS_URL` missing → dev 500s; ask the user for the value, don't invent one.
- Never grep barrel `.d.ts` files in `node_modules`; read the specific declaration.
- Answer Directus permission questions from the committed dump (`directus/config/collections/permissions.json`), not the live API; its records are keyed by `_syncId`, not the live id. See `docs/directus.md`.
