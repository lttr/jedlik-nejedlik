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
- **Ticket 04 started** (author role + dummy course, FP-11).
- Goal understanding: an Author role + policy on production that lets the
  content author manage the whole Kurzy content model in the Directus admin
  app (app_access true, admin_access false): full CRUD on `course` /
  `section` / `lesson` / `lesson_material` + file uploads; read-only on
  `order` / `order_consent`; read + create + delete on `entitlement` (the
  manual grant/unlock support path, no update). Probe coverage extends the
  harness with an author matrix; the dummy-course build, friction findings,
  and the manual entitlement grant are HUMAN-ONLY (they verify FP-11 — the
  author working without a developer) and stay unchecked here.
- Naming: glossary has no Author entry; role name **Autor** follows the
  existing Czech role names (Student, Redaktor). New role + new policy
  mirroring the Student structure (role ↔ single policy, sync-tracked).
- Intended build order: (1) inspect instance (existing Redaktor role users —
  decide how the real author's account gets the policy); (2) create Autor
  role + policy + permissions via REST (admin token via the ticket-01
  `claude mcp get directus` extraction, curl-like UA for Cloudflare);
  (3) author needs support reads the spec implies but doesn't spell out:
  `directus_users` read (limited fields) so the admin app can render/pick
  the student on order/entitlement rows, `directus_folders` read so the
  file library is browsable; (4) [TEST] probe author user + static token
  (env var `DIRECTUS_PROBE_AUTHOR_TOKEN`, value never committed; student
  probe tokens will be regenerated the same documented way since values
  aren't stored anywhere); (5) `author.probe.ts` — content CRUD allowed
  incl. multipart file upload, draft visibility, transactional write
  denials (order create/update, order_consent create, entitlement update),
  entitlement create+delete allowed, transactional reads allowed; self-
  cleaning; (6) run full probe suite (public + student + author) against
  production; (7) review field metadata for authoring UX; (8) author
  checklist for the human FP-11 steps recorded here; (9) re-pull dump +
  diff, typecheck, commit; ticket stays `in-progress` pending the human
  steps.
- File permissions decision: `directus_files` create/read/update for the
  author; delete only inside the "Materiály kurzů" folder subtree so a
  mis-click cannot destroy marketing assets (authors still fully manage
  their own Materials). Will verify empirically that upload + admin file
  library work with this shape.
- **Autor role + policy created on production** (role
  1dd066f4-e130-40e2-8585-247b3b2e7a0a, policy
  67bf15ab-fa2c-4d33-8961-ea4337cc4446; sync ids a42dc8e2… / d15b2dbf… in
  the dump). Policy `app_access: true`, `admin_access: false` — the admin
  app works, instance administration does not (probe-verified: `POST
/collections` and `POST /permissions` are 403). 27 permissions:
  - `course` / `section` / `lesson` / `lesson_material`: create + read +
    update + delete, all fields, **no status filter** — authors see drafts
    and config fields (`test_pass_threshold`, `unlock_rule`,
    `unlock_delay_days`), verified by probe.
  - `directus_files`: create/read/update everywhere; **delete only inside
    "Materiály kurzů"** (filter `folder == 6173b74f-…`) so an author
    mis-click cannot destroy marketing assets. Verified: delete of an
    uploaded Material 204, delete of a file outside the folder 403.
  - `order` / `order_consent`: read all fields (support view), no writes —
    order create/update/delete and consent create are 403 by omission.
  - `entitlement`: read + create + delete, **no update** (granted_at is
    immutable history; regrant = delete + create). Create carries preset
    `granted_at: "$NOW"` — empirically confirmed: a create WITHOUT
    `granted_at` passes the required-field validation and lands with the
    server timestamp, so the manual grant in the admin app needs only
    Student + Kurz. Fields limited to student/course/order/granted_at.
  - Admin-app support reads the spec implies: `directus_users` read limited
    to id/first_name/last_name/email (the M2O student picker template
    `{{first_name}} {{last_name}} ({{email}})` renders; `token`, `password`,
    `role` etc. stay denied — explicit field request is 403),
    `directus_folders` read (file-library tree).
- **Probe author fixture**: user `probe-author@jedlik-nejedlik.cz`
  ("[TEST] Autor Probe (nemazat)", id 67f8098f-2852-465d-bd9c-8738565dd740,
  role Autor, active) with a static token supplied to probes via
  **`DIRECTUS_PROBE_AUTHOR_TOKEN`**. Regeneration (same as the student
  tokens): with the admin token (`claude mcp get directus` from the repo
  cwd) `PATCH /users/67f8098f-…` with a fresh random `token`. Note: the two
  student probe tokens were **rotated** during this ticket (their values
  were never stored anywhere; rotation is the documented path) — any
  locally saved env values must be refreshed the same way.
- **Author probes**: `web/tests/probes/author.probe.ts` (18 tests) — full
  content lifecycle (draft course incl. config fields, section with unlock
  rule, text lesson create/update, multipart Material upload into the
  materials folder via new `probeUpload` helper in `support.ts`, junction
  attach + expansion read, deletes), folder-scoped file delete (in-folder
  204 / outside 403), transactional reads allowed + writes denied (order
  create/update/delete, consent create, entitlement update), manual
  grant/revoke path (create without granted_at → server-side $NOW, delete
  204), and no-administration checks. Suite self-cleans; afterAll admin
  sweep only as failure safety net. **Full matrix 59/59 green** (14 public
  - 27 student + 18 author) against production, `vp run typecheck` green,
    eslint clean.
- Verification: `vp run directus:pull` + `diff` clean (0 to-create/update/
  delete across all tracked collections); dump gains the Autor role, policy,
  and 27 permissions; schema snapshot unchanged (no schema was touched this
  ticket). Dump reviewed — no secrets (user tokens are not dumped).
- **Remaining: HUMAN-ONLY FP-11 steps** (dummy course authored in the admin
  app, friction findings, manual entitlement grant). Ticket 04 stays
  `in-progress`; checklist below.

### Checklist for the author (FP-11 verification — do in the admin app, no developer)

Předpoklad (jednorázově, admin): pozvat skutečnou autorku v administraci
(Nastavení → Uživatelé → Pozvat, role **Autor**), nebo nastavit heslo
účtu `probe-author@jedlik-nejedlik.cz` (jeho statický token pro proby tím
nezanikne). Administrace: https://obsah-jedlika.lttr.cz/admin

1. **Založit zkušební kurz** (Kurzy → +): název, slug, prodejní popis,
   obálka, cena v Kč, hranice úspěšnosti testu; stav nejdřív „Koncept",
   na závěr „Publikováno".
2. **Sekce — pokrýt všechna čtyři pravidla odemčení**: jedna sekce
   `immediate` (hned), jedna `test`, jedna `manual` (ruční), jedna
   `time_since_purchase` (s vyplněným počtem dní — pole se ukáže až po
   zvolení tohoto pravidla). Seřadit přetažením.
3. **Lekce**: alespoň jedna video lekce (Cloudflare Stream UID do pole
   Video UID + poznámky do těla) a jedna textová lekce (tělo). Seřadit.
4. **Doplňkový materiál**: k jedné lekci nahrát alespoň jeden soubor
   (PDF); při nahrání zvolit složku **Materiály kurzů**.
5. **Ruční přidělení oprávnění**: Oprávnění ke kurzům → + → vybrat
   studenta „[TEST] Student Bez opravneni" a nový zkušební kurz, uložit
   (Čas přidělení se předvyplní). Ověřit, že záznam vznikl, a potom ho
   zase **smazat** (mazání je zároveň postup pro ruční odebrání přístupu).
   Pozn.: nemazat existující oprávnění „[TEST] Student S opravnenim ×
   [TEST] kurz publikovaný" — je to fixture pro proby.
6. **Zapsat si každé zadrhnutí** (co nešlo najít, co bylo matoucí, kde
   bylo potřeba rady) — nálezy se zapíší jako spec-level findings do
   tohoto souboru a teprve pak se ticket 04 uzavře.

## 2026-07-23 — Wrap-up (orchestrator)

- **Wrap-up started** after tickets 01–03 done and ticket 04's automatable
  half done (04 stays in-progress on the human FP-11 steps above).
- Project checks greened up (commit a61a9d3): shared probe helpers/fixtures
  extracted to `web/tests/probes/support.ts` (fallow clone groups), fallow
  entries/ignores for probe files + CLI-only deps + config-by-convention
  files, test-scoped oxlint overrides (`no-unsafe-type-assertion`,
  `no-await-in-loop`, `max-lines-per-function`, `vitest/expect-expect`
  assertFunctionNames) — `vp check` had been red on the probe files because
  its type-aware oxlint pass is stricter than the eslint pass the ticket
  sessions ran. Also formatted 3 stale `.aiwork` artifacts `vp check` was
  flagging (pre-existing, unrelated to this area).
- **Branch review** (medium effort, whole 5446604..HEAD diff) findings and
  resolutions — see `review.md`:
  1. `order_consent.granted_at` was client-writable — the only timestamp on
     a consent record rested on a client-controlled value (TO-7
     provability). Fixed on the instance: student create permission now
     presets `granted_at: $NOW` and drops the field from the writable list;
     probes assert the server-set timestamp and the 403 on supplying one.
     **Contract change for 04a: checkout must NOT send `granted_at`.**
  2. `order.price_czk` is a client-supplied snapshot with no relational
     validation possible at create. **Contract for 04b: never build the
     GoPay charge from `order.price_czk`; re-read `course.price_czk`
     server-side.** (Recorded here as the load-bearing note; no schema
     change.)
  3. Entitled-lesson probes asserted on ALL published courses' lessons —
     they would break the moment the author publishes the dummy course.
     Fixed: scoped to the entitled course via `filter[section][course]`.
  4. Author `directus_files` update was unrestricted (`fields: *` incl.
     `folder`), so the folder-scoped delete rule was bypassable by moving a
     marketing asset into Materiály kurzů first. Fixed: author file update
     now requires the file to be in the materials folder OR uploaded by the
     author; probe added (admin-uploaded stand-in asset, author PATCH 403).
  - Minor review notes accepted without change: author reads name+email of
    all users (needed for the M2O picker, fields probe-verified limited);
    reapplicability gaps (composite unique index + consent-flow operation)
    already documented above; `forget()` hardened against absent values.
- Probe suite after fixes: **61/61 green** against production (14 public +
  29 student + 18 author), two consecutive concerns covered by new tests.
  Probe tokens rotated again during wrap-up (documented regeneration path).
- Full checks: `vp check` green, eslint green, `nuxi typecheck` green,
  fallow green, `nuxi build` green, directus-sync `diff` clean after
  re-pull.
