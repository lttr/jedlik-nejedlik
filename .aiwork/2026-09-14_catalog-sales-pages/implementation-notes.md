# Implementation notes — Area 03: Catalog + Sales Pages

Short log for the maintainer: only what you have to act on or would be misled
without. Per-ticket entries appended by the orchestrator as tickets land.

## Run

- Clarity gate: the spec's Open Concerns are all deferred outside this area
  (launch-time fixture cleanup, area 04a's verification call, the unscheduled
  SimpleShop cutover). None changes what this run builds, so the run went
  ahead unattended rather than stopping for confirmation.
- The run executes in a cloud container. `web/.env` was written there from
  the container's environment (gitignored, never committed) so the probe
  config's `loadEnvFile` and `directus-sync` resolve tokens as documented.
- Parallel ticket worktrees were unusable in this harness: a subagent that
  enters a sibling worktree loses Bash and Edit. Tickets therefore ran one at
  a time in the task worktree, on the `catalog-sales-pages` branch.
- Chromium refuses to start as root with its sandbox on, which is what the
  Playwright preflight failure in a fresh cloud container was. The global
  `~/.playwright/cli.config.json` now needs `launchOptions.chromiumSandbox:
false`; `scripts/cloud-setup.sh` writes it (commit `679cc9f`).

## 01 — Rename Student → Account

- `registerStudent` keeps its name on purpose: registration creates a
  Student-role user (`public_registration_role`); Authors are made in the Data
  Studio. Everything an Account can do (password change, reset, e-mail
  verification) moved to Account naming.
- The `areas.md` corrections were already on `master` from commit `24ebb03`;
  that step was a no-op.
- `docs/adr/0002-nitro-mediated-auth-sessions.md` still uses the old names
  (`getDirectusServerClient`, "Students authenticate"); left as the historical
  record.
- The in-app pass activated the throwaway user through the admin API rather
  than the verification e-mail; the e-mail link path is covered by the auth
  probe, not by this ticket's flow.

## 02 — Directus teaser, cover folder, fixture

- **Needs the site owner:** an Author cannot use the cover picker as intended.
  The Autor policy's `directus_files` create rule pins uploads to „Materiály
  kurzů" by UUID and its read rule covers only that folder, so an Author can
  neither upload into nor browse `Public/kurzy`. Today a cover has to be
  uploaded by an admin or Redaktor. Widening the Autor policy is a
  production permission change; decide whether Authors get read + create on
  `Public/kurzy` (`directus/config/collections/permissions.json`, Autor rows).
- No Public-policy change was needed: its files read rule already matches
  `folder.parent.name icontains "Public"`, which covers the new child folder.
- The new fixture lessons carry a placeholder `body` beyond the ticket's
  wording, because `student-scoping.probe.ts` asserts every lesson of course 1
  has a string body. `video_uid` is nullable, so no placeholder video exists.
- The fixture cover is a generated 1200×675 gradient PNG, not a photo. The
  `[TEST]` course must be removed or archived before launch (spec, Open
  Concerns).

## 03 — Catalog

- **Check once on a normal network:** Chromium in the cloud container cannot
  tunnel TLS through the agent proxy, so Directus covers never load in the
  headless browser there. The anonymous cover permission was proven with
  `curl` (200) and the visual pass fed the browser those same bytes via a
  Playwright route (recipe in `run-jedlik-nejedlik`, "Cloud container
  quirks"). Reload `/kurzy` once outside the container to see the cover load
  natively.
- The status filter is `_in: ["published", "draft"]`, not `published` alone:
  Directus's own policy decides who gets drafts (ADR 0004), and the explicit
  list keeps any future status (archived) out. `status` rides in the payload
  for the „Koncept" badge (ticket 05).
- Directus is asked for `sort: ["sort", "id"]`; Postgres puts nulls last on
  ascending sort, which matches `compareCatalogOrder`, but the comparator is
  still applied server-side so the order does not rest on a database default.
- `CourseCollection.sections` and `SectionCollection.lessons` in the directus
  layer were widened to accept nested objects, so the SDK types the
  `sections.lessons.id` selection used for the lesson count.
- The desktop grid uses `auto-fill` rather than puleo's `auto-fit`, so a lone
  course keeps its column width instead of stretching across the row.
