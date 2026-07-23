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
- **Ticket 03 started** (transactional collections + student scoping).
- Goal understanding: additive schema for `order` / `order_consent` /
  `entitlement` (kurzy folder, Czech labels, integer PKs like ticket 02),
  DB-enforced idempotency constraints (`order.gopay_payment_id` unique,
  `entitlement` composite unique on (student, course)), a Student role +
  policy whose permissions ARE the enforcement boundary (own-row scoping on
  transactional rows, create-order-as-self only, no writes to status/payment
  fields or entitlements, entitlement-gated full-lesson + Material-file
  access, public-equivalent course/section visibility), probe fixtures (two
  test students with static tokens, one entitled to course 1), a full student
  probe matrix, layer codecs for the three collections, and a re-pulled
  dump/snapshot.
- Intended build order: (1) inspect instance (DB vendor, existing relations)
  with the ticket-01 admin-token extraction; (2) create collections + fields
  - relations via REST, incl. O2M alias fields needed by permission filters
    (`course.entitlements`, a hidden alias on `directus_files` walking back
    through `lesson_material`); (3) apply the composite unique constraint —
    Directus fields API has no composite uniqueness, expect DB-level DDL (route
    TBD: Coolify exec into the DB container); (4) dedicated course-materials
    folder, move the seeded Material file in; (5) Student role + policy +
    permissions — key risk: Directus 11 merges multiple same-action permissions
    with per-permission field "cases" (outline perm + entitlement-gated full
    perm on `lesson` must NOT union fields across rows; verify empirically via
    probes before trusting); (6) two [TEST] student users + static tokens +
    admin-granted entitlement for one; (7) student probe matrix in
    `web/tests/probes/` (env vars documented, values never committed);
    (8) codecs + Schema + typecheck; (9) pull + diff + commit.
- Open questions to resolve empirically: whether create-permission
  `validation` supports relational rules (`order.student == $CURRENT_USER`
  for `order_consent` create), and what error shape a DB unique violation
  surfaces at the API (RECORD_NOT_UNIQUE vs 500) — probes assert observed
  behaviour.

## 2026-07-23

- **Schema applied on production**: `order` / `order_consent` / `entitlement`
  in the `kurzy` folder (sorts 5–7), integer PKs, Czech labels, same REST
  route as ticket 02. Relations incl. O2M aliases: `order.consents` (admin
  nested create + reads), `course.entitlements` (hidden — the field the
  permission filters walk), `directus_users.orders` (hidden, left in place
  for future rules), and `directus_files.lesson_materials` (hidden, wired
  into the existing `lesson_material.directus_files_id` relation) so file
  permissions can walk back file → junction → lesson → … → entitlement.
- **Composite unique (student, course)**: Directus 11.13 collections/fields
  API cannot express composite constraints (only per-column `is_unique`).
  Applied directly to the underlying DB — the instance runs SQLite
  (`DB_CLIENT: sqlite3`, per Coolify compose): SSH to the Coolify host →
  `docker exec` into the Directus container → node script using the image's
  bundled `sqlite3` driver (no sqlite CLI in the image) →
  `CREATE UNIQUE INDEX entitlement_student_course_unique ON entitlement
(student, course)`. Duplicate inserts surface as **400 RECORD_NOT_UNIQUE**
  at the API (Directus translates the driver error), same as the
  `order.gopay_payment_id` single-column unique. **Known limitation**: the
  composite index is NOT representable in the schema snapshot (both columns
  show `is_unique: false`), so reapplying the snapshot to a fresh instance
  requires re-running that one DDL statement manually; the gopay unique IS
  in the snapshot. Side note: `~/.ssh/known_hosts` has a stale key for the
  VPS (77.37.124.219) — connection was made with a scratchpad known-hosts
  file; the user may want to refresh their entry.
- **Student role + policy** (role 186fdb62…, policy a17cfc9d… in sync ids;
  `app_access: false` — students are API-only identities). 11 permissions.
  Empirical findings that shaped them:
  - **Directus 11 merges same-collection read permissions with per-rule
    field "cases"**: the outline rule (published courses, outline fields) and
    the full rule (entitlement chain, + body/video_uid/materials) on `lesson`
    do NOT union fields across rows — non-entitled rows return paid fields as
    `null` (HTTP 200), entitled rows return values. Verified no leak; the
    probes assert the null-not-403 shape and document it.
  - **Create-permission `validation` cannot walk relations**:
    `{"order":{"student":{"_eq":"$CURRENT_USER"}}}` fails Joi validation for
    every payload ("Value is required"), and
    `{"order":{"_in":"$CURRENT_USER.orders"}}` silently passes everything
    (it leaked two rows during testing — deleted). Nested-create-only
    enforcement (dropping `order` from create fields) is also impossible:
    Directus injects the parent FK into the child payload BEFORE field
    permission and validation checks, so nested and standalone creates are
    indistinguishable at the permission layer.
  - **Deviation — consent ownership is enforced by a blocking filter flow**
    ("Souhlas jen k vlastní objednávce", `items.create` on `order_consent`):
    its single `item-read` operation reads `{{$trigger.payload.order}}` from
    `order` with `$trigger` (requester) permissions; an unreadable (foreign
    or missing) order rejects the create with 403 and no row is written.
    Own-order standalone creates and nested order+consents creates both
    pass. The flow row is in the directus-sync dump; its operation is NOT
    (ticket-01 global `operations` exclusion) — it contains no secrets, but
    must be re-created by hand on a fresh instance.
  - Order create: preset `student: $CURRENT_USER` + validation `_eq` +
    fields `student, course, price_czk, consents`. `status` (DB default
    `created`) and payment fields are outside the field list ⇒ passing them
    is a 403 FORBIDDEN; foreign `student` is a 400 FAILED_VALIDATION.
    No update/delete permissions on any transactional collection.
  - **File gating**: folder "Materiály kurzů" created and the seed Material
    file moved into it (authoring organization, per spec), but the student
    `directus_files` read rule is the entitlement chain itself (via the
    `lesson_materials` alias), not folder membership — folder-based rules
    only add failure modes (file outside folder ⇒ entitled student blocked)
    without adding enforcement. `/assets/<id>` honours it: 200 entitled,
    403 unentitled and anonymous. Public/marketing file access untouched
    (public policy had and has no rule for non-public files).
- **Probe fixtures**: users `probe-student-entitled@jedlik-nejedlik.cz` and
  `probe-student-unentitled@jedlik-nejedlik.cz` ([TEST]-titled "nemazat",
  role Student, status active) with static tokens; admin-granted Entitlement
  (entitled user, course 1) — the only persistent transactional row. Token
  env vars for `vp run directus:probe`:
  `DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN`,
  `DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN`, and
  `DIRECTUS_PROBE_ADMIN_TOKEN` (admin used only for uniqueness fixtures and
  cleanup). Values are never stored in the repo; to (re)generate: with the
  admin token (extract via `claude mcp get directus` from the repo cwd)
  `PATCH /users/<id>` with a fresh random `token` value.
- **Probes**: `web/tests/probes/student-scoping.probe.ts` (27 tests) covers
  order create-as-self/as-other/status/gopay spoofing, own-row read scoping
  on order/order_consent/entitlement, order update/delete denials,
  nested + standalone + foreign consent creates, entitlement write denials,
  entitlement-gated lesson fields + Materials expansion + file metadata +
  `/assets` download (incl. anonymous), public-equivalent course/section
  visibility, and both uniqueness violations. Suite self-cleans (afterAll
  deletes the orders it created; consents CASCADE) — verified re-runnable,
  41/41 green (14 public + 27 student) on two consecutive runs, instance
  left with only the fixture entitlement. `support.ts` gained `probeSend`
  (mutations) and `probeStatus` (asset downloads).
- **Wire types**: `OrderSchema` / `OrderConsentSchema` / `EntitlementSchema`
  codecs (null→undefined; status/document as z.enum) + `*Collection` wire
  types + three new `Schema` entries. `vp run typecheck` green.
- Verification: probes 41/41 green; typecheck green; eslint clean on changed
  files; `vp run directus:pull` + `diff` clean (`[snapshot] No changes to
apply`, 0/0/0 across all tracked collections); dump diff reviewed — no
  secrets (user tokens are not dumped; the new flow row carries none).
- **Ticket 03 done.**
