# Implementation notes — Directus data model (area 01)

Chronological log. Newest entries at the bottom.

## 2026-07-22

- **Ticket 01 started** (config-as-code baseline, directus-sync).
- Goal understanding: make the production Directus instance's config a
  committed, diffable artifact BEFORE any Kurzy schema exists. Plan:
  (1) check instance Directus version via MCP/API; (2) verify directus-sync
  compatibility (needs `directus-extension-sync` + Directus ≥ 11.16.1 for
  latest, else pin) via npm/web docs; (3) install `directus-extension-sync`
  on the instance — programmatically if possible; (4) add pull-only
  directus-sync config + `vp run`-able script in the repo (token from env at
  runtime, never committed); (5) run pull, commit baseline dump; (6) run
  `diff`, confirm clean.
- Credentials plan: no `DIRECTUS*` env vars exposed in this shell; will look
  for a documented token pattern or ask via blocker if nothing usable exists.
- **Instance version: Directus 11.13.1** — confirmed two ways: Coolify service
  compose (`directus/directus:11.13.1`, service `w4kgkwkow0wcw4sok80wssko`)
  and authenticated `GET /server/info` (version is only revealed to admins,
  which doubles as an admin-access check for the token).
- **directus-sync pin decision: exact `3.5.1` (latest).** The instance is
  below the 11.16.1 the ticket flagged, but research shows no hard minimum:
  the CLI has no version gate (soft `compareVersions` adaptation in
  `migration-client.ts`); the tractr repo's "chore: directus 11.13.1
  compatibility" commit is included in the 3.5.0 release cycle (3.4.1 was
  tested at 11.10.0, 3.5.0 at 11.16.1, 3.5.1 at 11.17.1 — README badges per
  tag); the 11.17.x compatibility PRs (#205, #206) touched only e2e fixtures
  and docs, no CLI code; and 3.5.1 adds a pull-relevant fix (#207, filter
  user-attached policy accesses on pull). Empirically `pull` and `diff` run
  clean against 11.13.1. Pinned exactly (no `^`) in root `package.json` so
  upgrades are deliberate.
- **`directus-extension-sync` was already installed** on the instance
  (v3.0.6, source `registry`, enabled — verified via `GET /extensions`).
  Extension host range `^11.0.0` matches 11.13.1. No install action needed.
- **Credentials resolved without blocker**: the Directus MCP server this
  environment already uses is authenticated with an admin-capable token
  (role "MCP"; passes `/server/info` version + reads on roles/policies/
  permissions/flows/settings). The same token is extracted at runtime from
  `claude mcp get directus` into `DIRECTUS_TOKEN` — same credential, same
  access level as every MCP call in the session; never printed, never
  committed. Repo config takes `DIRECTUS_TOKEN` from env at runtime.
- **Repo layout choice**: dump lives in top-level `directus/config/`
  (dumpPath), config at root `directus-sync.config.cjs` (default lookup path;
  `.cjs` because root package.json is `"type": "module"`). Scripts are
  vite-plus tasks `directus:pull` / `directus:diff` (run via `vp run …`).
- **Deviation / tradeoff — flow `operations` excluded from the dump**: the
  first pull revealed a live Ecomail API key embedded in the request-operation
  headers of the marketing flows (that is how Directus stores it). Committing
  it would leak a third-party credential. A redact-on-dump hook cannot work
  with criterion (e): `diff` compares the local dump against _raw_ remote
  data (no `onDump` hook in `data-differ.js`), so redaction would keep diff
  permanently dirty. `excludeCollections: ["operations"]` keeps secrets out
  of git and diff clean; flows themselves (no secrets) stay tracked. Open
  question for later: move the key into `FLOWS_ENV_ALLOW_LIST` env on the
  instance and re-include operations.
- Also excluded GraphQL/OpenAPI `specs` from the dump (derived artifacts, not
  config); enabled `sortJson` for stable diffs.
- **vp cache pitfall**: root package.json scripts are cached by vite-plus
  (`run.cache.scripts: true`), and a second `vp run directus:diff` replayed a
  cached "Done" without touching the network — that would mask drift. The two
  commands are therefore defined as vite-plus _tasks_ with `cache: false`
  (verified: both runs now show "cache disabled"). Dump dir
  `directus/config/**` added to `ignorePatterns` (fmt+lint) because oxfmt
  wanted to reformat 20 machine-generated JSON files, which would fight every
  future pull via the pre-commit hook.
- Side effect of `vp install`: lockfile refreshed vite-plus 0.2.4 → 0.2.5
  (allowed by existing catalog range).
- Verification: `directus-sync diff --debug` after the final pull reports
  `[snapshot] No changes to apply` and 0 to-create / 0 to-update /
  0 to-delete / 0 dangling for all tracked collections (settings, folders,
  translations, flows, roles, policies, permissions, presets, dashboards,
  panels). Dump scanned for secrets — none (Ecomail key absent).
- **Ticket 01 done** — all acceptance criteria met; committed as
  feat(directus): config-as-code baseline via pull-only directus-sync.
- **Ticket 02 started** (course content collections + public visibility).
- Goal understanding: additive schema on production — `course`, `section`,
  `lesson` in a `kurzy` collection folder with Czech admin labels; public
  (anonymous) role sees published courses + section/lesson outline only, with
  API-level denial of `lesson.body`, `lesson.video_uid`, Materials, and draft
  courses. Then: extend the `directus` layer Schema + zod codecs (z.input
  pattern from cef1a46), stand up an on-demand vitest probe harness in `web/`
  (anonymous probes now, structured for student/author in tickets 03/04),
  re-pull the directus-sync dump + schema snapshot, and drop the `_scaffold`
  pages/route rules from `customers`/`lms`/`shop` layers.
- Intended build order: (1) inspect instance (public policy id, existing
  collections) via MCP/dump; (2) create folder + collections + fields +
  relations via MCP (M2M junction `lesson_material` — glossary term
  Material — with `lesson_id`/`directus_files_id`); (3) add public read
  permissions on the `$public` policy: course (status=published, sales
  fields), section + lesson outline fields, both filtered to published
  courses via relational filter so draft-course outlines are denied too;
  (4) minimal `[TEST]`-marked seed (1 published + 1 draft course) via admin
  token for probes; (5) codecs/types + typecheck; (6) vitest probes as a
  separate non-default task `directus:probe` (cache off, not in verify:all);
  (7) re-pull, commit.
- Public permission interpretation: spec lists outline fields as `title`,
  `sort`, `type`, relation ids — I also expose primary keys (`id`) since
  relations are unusable without them, and course sales fields
  (`slug`, `description`, `cover`, `price_czk`, `status`, timestamps) since
  the sales page (03) renders them. `test_pass_threshold` stays non-public
  (config, not sales copy).
- **Schema applied on production** via REST (admin token from the ticket-01
  `claude mcp get directus` extraction — note it must run from the repo cwd,
  the MCP server is local-scope config; also the instance sits behind
  Cloudflare bot protection, so non-curl clients need a curl-like
  User-Agent). Collections: `kurzy` folder; `course` / `section` / `lesson`
  with integer PKs (matches existing marketing collections), Czech
  translations on collections and fields, status choices copied verbatim
  from `articles`; `lesson_material` hidden junction (Lekce ↔
  directus_files) for the Materials M2M `files` interface. FP-11 touches:
  O2M alias fields (`course.sections`, `section.lessons`) with drag-sort,
  `unlock_delay_days` hidden unless `unlock_rule == time_since_purchase`,
  `video_uid` hidden for text lessons, slugified `slug` input with unique
  constraint, admin-app validation 0–100 on `test_pass_threshold`.
- Timestamps: `date_created`/`date_updated` on all three collections,
  `user_created` on `course` only ("where sensible" — sections/lessons are
  always the author's).
- **Public policy** (`$public`, id abf8a154-5b1c-4a46-ac9c-7300570f4f17):
  three read permissions. `course` filtered `status == published`, fields
  id/status/sort/title/slug/description/cover/price_czk/sections; `section`
  filtered `course.status == published`, fields id/sort/course/title/lessons
  (unlock_rule/unlock_delay_days deliberately non-public); `lesson` filtered
  `section.course.status == published`, fields id/sort/section/title/type.
  Draft courses therefore disappear from the outline at every level. No
  permission on `lesson_material` or non-public files ⇒ Materials denied.
  Directus quirk noted: explicitly requesting a denied _column_ returns 403
  FORBIDDEN, but a denied _relational alias_ (`materials`) is silently
  stripped from the response — verified with a seeded junction row that
  nothing (not even ids) leaks; probes assert both behaviours.
- **Seed data kept on the instance** (probes are re-runnable, ticket 03
  reuses it), all rows `[TEST]`-prefixed and marked "nemazat" in the
  description: published course `test-kurz-publikovany` (id 1; section with
  video+text lessons, video lesson has body+video_uid and one Material —
  file c1cee206-b8e2-41fb-975c-862b84f65a84, uploaded outside any Public
  folder so the file itself is non-public) and draft course `test-kurz-draft`
  (id 2, one section+lesson) to prove draft denial. Ticket 04's real dummy
  course is separate; these can be deleted once role probes no longer need
  them.
- **Wire types**: `CourseSchema`/`SectionSchema`/`LessonSchema` codecs in the
  directus layer (public catalog/outline shapes, null→undefined);
  `*Collection` wire types = `z.input` of codec + non-fetched columns;
  `lesson_material` junction typed as a plain interface. All four added to
  `Schema`. `vp run typecheck` green.
- **Probe harness**: `web/tests/probes/` with `support.ts` (probe fetch
  helper + `roleToken(envVar)` for the student/author tickets) and
  `public-visibility.probe.ts` (14 anonymous assertions). Files use a
  `.probe.ts` suffix and are included only by `web/vitest.probes.config.ts`,
  so no default vitest run ever picks them up; task `vp run directus:probe`
  (cache off, not in verify:all) runs them. Own `web/tests/tsconfig.json`
  (Nuxt's generated tsconfigs don't cover `web/tests/`). Lint override:
  `node/no-process-env` off for `web/tests/**`.
- **Deviation / toolchain workaround**: `vp test` cannot run these — the
  catalog aliases `vitest` to `@voidzero-dev/vite-plus-test`, whose latest
  (0.1.24) ships no `vitest` bin and whose bundled rolldown JS is
  version-skewed against the vite-plus 0.2.5 CLI native binding
  (`builtin:vite-wasm-fallback` enum error). Workaround: web devDependency
  `vitest-probe: npm:vitest@^4.1.10` (alias name escapes the pnpm override;
  its `vite` dep is overridden to vite-plus-core 0.2.5, which matches the
  binding) and the task invokes `node node_modules/vitest-probe/vitest.mjs`.
  DELETE the alias and switch to `vp test` once vite-plus-test catches up.
- `_scaffold` pages and their route rules removed from `customers`, `lms`,
  `shop` layers (layer configs are now bare markers again).
- Verification: `vp run directus:probe` 14/14 green (anonymous matrix incl.
  draft-course denial, paid-field 403s, Materials junction denial, nested
  outline reads); `vp run typecheck` green; eslint clean on changed files;
  `vp run directus:pull` + `diff` clean (new collections/fields/relations in
  snapshot, three public permissions in the dump). Pre-existing `vp check`
  formatting complaints in three old `.aiwork` files left untouched.
- **Ticket 02 done.**
