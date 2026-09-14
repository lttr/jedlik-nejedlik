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
