---
references:
  - "Parent: ../2026-06-09_kurzy-platforma/implementation-areas.md (area 01)"
  - "PRD: ../2026-06-09_kurzy-platforma/spec.md (TO-7, TR-1, TR-4, FP-11)"
  - "ADR: docs/adr/0001-directus-system-of-record.md"
  - "GLOSSARY.md"
---

# Spec: Directus data model + permissions (area 01)

## Problem Statement

The Kurzy platform has no data model. Nothing downstream can start: auth (02)
has no student role to register into, catalog (03) has no Course to render,
checkout (04a) has no Order or consent record to write, and the LMS (06) has no
Entitlement to gate on. The PRD decided that Directus is both the system of
record and the enforcement boundary (TR-1, TR-4) — so the access rules for
who sees paid content must be built into Directus itself, correctly, before any
app code exists to hide behind. The author also needs to manage course content
entirely through the Directus admin app (FP-11), which only works if the
collections are shaped for hand-authoring.

## Solution

Design and apply the wave-2 Directus schema — Course, Section, Lesson, Order,
consent records, Entitlement — together with the three access roles (public,
student, author) and their permission policies, on the shared Directus
instance. Commit the schema snapshot and the permission definitions to the
repo so the model is reviewable and reapplicable. Seed one dummy course by
having the author build it through the Directus admin app, which
simultaneously verifies FP-11. Extend the `directus` layer's wire types and
zod codecs so downstream areas consume the new collections type-safely.

Later-wave collections stay with their consumers: Progress lands in 06,
Test/question/attempt schema in 07 — incremental additions to the committed
snapshot.

## User Stories

1. As an author, I want to create a Course with its Sections and Lessons entirely in the Directus admin app, so that I can manage content without developer help (FP-11).
2. As an author, I want Czech labels on collections and fields in the admin app, so that content management matches the vocabulary I use (Kurz, Sekce, Lekce).
3. As an author, I want to set a price in CZK on a Course, so that the shop can sell it.
4. As an author, I want to set a per-Course test pass threshold, so that the quiz module (07) evaluates attempts against my chosen bar (BP-14).
5. As an author, I want to order Sections within a Course and Lessons within a Section, so that Students see the curriculum in the intended sequence.
6. As an author, I want to choose an Unlock Rule per Section (immediate, test, manual, time since purchase), so that I control how Students progress (BP-13).
7. As an author, I want to attach downloadable Materials to a Lesson, so that Students get worksheets alongside videos (O-10).
8. As an author, I want to reference a video by its Cloudflare Stream UID on a Lesson, so that video stays out of Directus storage (TR-2).
9. As an author, I want a draft/published status on a Course, so that unfinished courses never appear publicly.
10. As a public visitor, I want to read published Courses and their Section/Lesson outline, so that the sales page (03) can show what a course contains.
11. As a public visitor, I must NOT be able to read Lesson bodies, video UIDs, or Materials, so that paid content never leaks through the public role (ADR risk, R-5).
12. As a Student, I want an account role that self-registration (02) can assign, so that I exist as a Directus end-user identity distinct from staff.
13. As a Student, I want to create an Order for myself and read only my own Orders, so that checkout (04a) works with my own token and I never see other Students' purchases.
14. As a Student, I must NOT be able to update Order status or payment fields, so that only the trusted server flow (04b) can mark an Order paid.
15. As a Student, I want to read only my own Entitlements, so that the LMS knows which Courses I own without exposing anyone else's.
16. As a Student, I must NOT be able to create or modify Entitlements, so that access is granted only by the payment notification flow (04b).
17. As a Student with an Entitlement, I want to read the full Lessons of that Course (body, video UID, Materials), so that I can consume what I bought.
18. As a Student without an Entitlement, I must get an API-level denial on full Lesson content of that Course, not just hidden UI (R-5, TR-4).
19. As a Student, I want my consent records readable to me, so that I can see what document versions I agreed to.
20. As the checkout flow (04a), I want to store N consent records per Order, each with a document kind, version, and timestamp, so that §1837 and terms consent are provable (TO-7, O-14).
21. As the payment notification flow (04b), I want Entitlement uniqueness per Student × Course enforced by the database, so that repeated GoPay notifications cannot double-grant.
22. As the payment notification flow (04b), I want a unique GoPay payment ID field on Order, so that notification handling is idempotent.
23. As the invoicing flow (05), I want an invoice ID field on Order, so that a present value means "already invoiced, skip" (TO-4).
24. As a developer, I want the schema snapshot and permission definitions committed to the repo, so that the model is reviewable, diffable, and reapplicable to another instance.
25. As a developer, I want wire types and zod codecs for the new collections in the `directus` layer, so that areas 02–09 consume them without hand-writing types.
26. As a developer, I want Entitlements creatable by an admin token independently of any Order, so that LMS development (06) can seed access manually.
27. As a future maintainer, I want the model extensible toward certificates and physical products without building them, so that R-2 and O-8 stay cheap later.

## Implementation Decisions

### Naming contract (fixes the shared contract for all downstream areas)

- Collection and field technical identifiers are **English snake_case,
  singular**: `course`, `section`, `lesson`, `order`, `order_consent`,
  `entitlement`. (Existing marketing collections are mixed; the Kurzy bounded
  context is uniformly singular, matching the implementation-areas doc.)
- Czech user-facing labels are set as Directus collection/field translations
  and notes, so the author's admin experience is Czech while code stays
  English. Glossary terms are canonical: never introduce "product", "module",
  "attachment" etc. (see GLOSSARY.md Avoid lists).
- All Kurzy collections live in a `kurzy` collection folder in the admin app
  to separate them from marketing content.

### Collections

Directus system fields (`id`, `date_created`, `user_created`, `date_updated`,
`sort` where noted) are used instead of custom equivalents.

- **course** — `status` (draft|published|archived), `title`, `slug` (unique),
  `description` (sales copy, rich text), `cover` (Directus file),
  `price_czk` (integer; CZK only per BP-5, spolek is not a VAT payer),
  `test_pass_threshold` (integer percent, per-course per BP-14), `sort`.
  Course is the only sellable; no generic "product" abstraction is built
  (R-2 — extensibility means the Order shape doesn't preclude other item
  types later, not that we model them now).
- **section** — `course` (M2O), `title`, `sort`, `unlock_rule`
  (choice: `immediate` | `test` | `manual` | `time_since_purchase`;
  default `immediate`), `unlock_delay_days` (integer, only meaningful for
  `time_since_purchase` — the per-student clock runs from Entitlement grant,
  O-19). The unlock engine itself is area 07; catalog and player only render
  this metadata. The Test relation and its blocking flag arrive with 07's
  schema.
- **lesson** — `section` (M2O), `title`, `sort`, `type` (video|text),
  `video_uid` (Cloudflare Stream UID, string, nullable — the only video
  reference per TR-2), `body` (rich text, for text lessons and video notes),
  `materials` (M2M to Directus files — downloadable Materials). Video
  duration/thumbnail fields are area 09's incremental addition.
- **order** — `student` (M2O to directus_users), `course` (M2O), `status`
  (created|paid|cancelled), `price_czk` (integer snapshot at order time),
  `gopay_payment_id` (string, nullable, unique — 04b idempotency key),
  `fakturoid_invoice_id` (string, nullable — 05 idempotency key). One Order
  buys one Course (glossary; no cart).
- **order_consent** — `order` (M2O), `document` (choice: `terms` |
  `withdrawal_1837` | `gdpr` — extensible), `document_version` (string),
  `granted_at` (timestamp). N records per Order (TO-7); exact document set
  and checkbox form are area 10's, the shape here supports both variants.
- **entitlement** — `student` (M2O to directus_users), `course` (M2O),
  `order` (M2O, nullable — manual grants for dev/support have no Order),
  `granted_at` (timestamp). **Unique constraint on (student, course)** — the
  idempotency contract 04b relies on. Written by `shop`, read by `lms`
  (layer-ownership contract).

### Roles and policies

Three roles per the areas doc. The Nitro service account is deliberately
deferred to 04b (first server-side consumer), same as the scaffolding area
deferred the server client wrapper.

- **public** — read `course` (published only), `section`, and `lesson`
  restricted to outline fields (`title`, `sort`, `type`, section/course
  relations). Explicitly NO access to `lesson.body`, `lesson.video_uid`,
  `materials`, and no access at all to `order`, `order_consent`,
  `entitlement`. Existing marketing-collection permissions are untouched.
- **student** — the role area 02 assigns on registration.
  - `order`: create with `student == $CURRENT_USER` enforced by permission
    preset/validation; read own only; no update, no delete.
  - `order_consent`: create only for own Orders; read own.
  - `entitlement`: read own only; no create/update/delete.
  - `course`/`section`: same as public.
  - `lesson`: full fields (`body`, `video_uid`, `materials`) only where an
    Entitlement chain exists — permission filter walking
    lesson → section → course → entitlements → student == `$CURRENT_USER`.
    This relational filter IS the enforcement boundary (TR-4); app code never
    substitutes for it.
  - Material file downloads: gated via Directus file permissions (course
    materials in a dedicated folder readable only through the same
    entitlement-scoped rule; public marketing assets unaffected).
- **author** — full CRUD on `course`, `section`, `lesson` and file uploads;
  read on transactional collections (`order`, `order_consent`,
  `entitlement`) for support, plus create/delete on `entitlement` (manual
  unlock/grant path). Instance administration stays with the existing admin.

### Persistence of the model in the repo

- Data model (collections/fields/relations): Directus **schema snapshot**,
  exported from the instance and committed. Later areas (06, 07, 09) extend
  this same snapshot incrementally.
- Roles/policies/permissions are NOT part of Directus schema snapshots. They
  are persisted with **directus-sync (tractr), pull-only**: configure in the
  admin app, `pull` the JSON dump into the repo, commit; `diff` on demand for
  drift detection. `push` is not part of the workflow (read-only use decided).
  Requires the `directus-extension-sync` Marketplace extension on the
  instance and Directus ≥ 11.16.1 (verify version first; pin an older
  directus-sync if the instance is older).

### Wire types

- The `directus` layer's `Schema` interface gains the six collections; zod
  wire codecs remain the single source of truth with wire types derived via
  `z.input` (the pattern established in the scaffolding follow-up). Codecs
  normalise `null → undefined` per the existing convention.
- No new client, no server wrapper, no composables — those belong to areas
  02+.

### Seed data

- One dummy course (a few Sections covering each unlock-rule value, video and
  text Lessons, one Material) built by the author **through the Directus
  admin app** — this is FP-11's verification and the seed step in one.
- One test student account with a granted Entitlement to the dummy course, and
  one without, for the permission probes.

## Testing Decisions

- The single behavioral seam is the **Directus REST API** of the target
  instance. Good tests assert externally observable access behavior per role —
  what each token can read/write — never Directus internals or admin-app UI
  state.
- Permission matrix probes run as anonymous, student-with-entitlement,
  student-without-entitlement, and author against the deployed rules. The
  matrix covers: public outline visibility, public denial on paid fields,
  student own-row scoping on `order`/`entitlement`/`order_consent`, student
  entitlement-gated `lesson` access, student write denials (order status,
  entitlement), and the (student, course) uniqueness violation on
  `entitlement`.
- Probes are **committed vitest integration tests in the web app**, run on
  demand (not in CI by default) against the production instance with role
  tokens supplied via environment. There are no existing API-probe tests in
  the repo to mirror; these establish the pattern areas 06/07 extend.
- Wire types are verified by the existing typecheck seam (`vp run typecheck`);
  codecs get unit coverage only if the repo already has a codec test pattern —
  no new test infrastructure for this area.
- FP-11 is verified manually: the author builds the dummy course in the admin
  app without developer intervention; friction found there is a spec-level
  finding, not a doc footnote.

## Out of Scope

- `progress` collection (area 06), test/question/test-attempt collections and
  the Test↔Section relation incl. blocking flag (area 07).
- Unlock-rule evaluation — 01 only stores the configuration.
- Auth flows, registration wiring, password reset (area 02); only the student
  role itself is created here.
- Any UI: catalog, checkout, player, admin upload page.
- Nitro service-account role and server-side Directus client (area 04b).
- Video duration/thumbnail fields and ingestion webhooks (area 09).
- Legal document content and versioning workflow (area 10) — `order_consent`
  only stores whatever version identifier 10 later defines.
- Certificates, physical products, licence seats — the model must not
  preclude them (R-2, O-8), but nothing is built.
- Migration of any existing SimpleShop customers (TO-8: clean start).

## Further Notes

Decisions resolved with the user (2026-07-22):

1. **Probes** — committed vitest integration tests in the web app (Node
   toolchain; Deno rejected to avoid a second runtime).
2. **Target instance** — **production directly** (obsah-jedlika.lttr.cz).
   The areas doc's "staging Directus" is superseded: new collections and
   roles are additive and can't touch marketing content; permissions are
   probe-verified before any real student exists.
3. **Permissions persistence** — directus-sync, **read-only** (pull + diff;
   no push). Chosen after research: Directus has no built-in
   permissions-as-code, and directus-sync is the community standard.

The Directus MCP server available in this environment can introspect and
mutate the live instance; it is a natural implementation aid for building the
schema and exporting definitions.
