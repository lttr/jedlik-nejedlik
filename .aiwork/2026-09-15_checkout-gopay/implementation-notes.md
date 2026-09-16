# Implementation notes — Area 04: Checkout + GoPay

A log for the maintainer. Entries are things you have to act on, or would be
misled without. What was built and which files moved is in the diff.

## Orchestration decisions (spec was silent)

These were settled before the first implementer ran, from
`research-repo-seams.md`, so six agents would not each answer them differently.

- **Ticket order is 01+02 → 03 → 04+05+06, not the frontier the `blocked_by`
  graph allows.** Ticket 05 is only blocked by 01, so it could have run
  alongside 03. It was held behind 03 anyway because both need the Billing
  Details form component and ticket 05 says only "build it here if this ticket
  lands first" — under parallelism that is a coin flip that ends in two
  components. Ticket 03 owns it; 05 imports it.

- **Ticket 03 owns the shared notice/error component** for the shop layer, and
  04 and 06 reuse it. The repo has no generic `<Alert>`/`<Notice>`: every
  notice today is an inlined `.error-message` / `.success-message` paragraph,
  and `<AuthFormError>` lives in the auth layer. Four tickets render notices;
  without an owner they would each invent one or reach across the layer
  boundary.

- **Flow tests (ticket 04) boot the Nuxt server as a child process and drive it
  with raw `fetch`**, in the style of `web/tests/probes/support.ts`. This is the
  spec's one new test seam and it has no prior art: the probes only ever hit the
  Directus REST API directly, and `@nuxt/test-utils` is not a dependency. Adding
  it was rejected — it changes the lockfile, which under this run's rules forces
  the ticket to run alone, and the raw-fetch helper matches the house style the
  probes already use.

- **Runtime config keys are placed in disjoint blocks** so tickets 01 and 02 do
  not fight over one object literal: 01 adds `shop: { directusToken }`, 02 adds
  `gopay: { ... }`, each as its own nested block in `privateSchema` rather than
  as sibling scalars.

## Prerequisites measured at the clarity gate

- `USER_REGISTER_URL_ALLOW_LIST` **is set** on the instance — the spec's Further
  Notes warned it might still be red and block ticket 06. `auth.probe.ts` passes
  27/27 as of 2026-09-16, so registration through the app works and 06 is
  unblocked. No action needed.

- `web/.env` does not exist in a fresh Claude Code remote container; the values
  arrive as real environment variables instead. `web/vitest.probes.config.ts`
  calls `process.loadEnvFile("web/.env")` unconditionally, so **every probe run
  dies with ENOENT before a single test loads** until the file is materialised
  from the environment. Worth making that call tolerate a missing file, since
  the env vars are already present when it is.

## Harness limitation worth knowing before the next `/implement-spec` run

An implementer subagent whose working directory is pinned at launch **cannot**
move itself into a per-ticket worktree with `EnterWorktree`. The switch appears
to succeed, but the Bash tool keeps the launch pin and then refuses every
command in every directory — it reports the newly entered worktree as "the
shared checkout". Neither `ExitWorktree` (refused from a subagent with a cwd
override) nor re-entering recovers; Read/Write/Edit keep working, so the agent
looks alive while being unable to run a single check.

The isolation is inherited, and it binds the orchestrator too: a session
isolated in the task worktree cannot run `git -C` against a sibling ticket
worktree either, so it cannot perform the rebase-then-fast-forward integration
the skill's §4.3 describes. The per-ticket worktree fan-out therefore fails at
both ends — the implementers cannot work in their worktrees, and the
orchestrator cannot merge them.

Consequence for this run: tickets were run one at a time in the task worktree
instead (the skill's "lone frontier ticket works directly in the task worktree"
case), which costs the parallelism but needs no cross-worktree merge at all —
commits land on the task branch directly. The fix for the skill is to pin
implementers to their worktree at launch rather than have them switch into it,
and to keep the orchestrator out of worktree isolation so it can still merge.

## Ticket 02 — GoPay client and mock gateway

- **The env vars are `NUXT_GOPAY_ENV`, `NUXT_GOPAY_GOID`, `NUXT_GOPAY_CLIENT_ID`,
  `NUXT_GOPAY_CLIENT_SECRET`** — the spec and the ticket name them without the
  prefix, but Nuxt only maps `NUXT_`-prefixed variables into runtime config (as
  with `NUXT_SESSION_PASSWORD`). `.env.example` and the run skill carry the real
  names. **Add `NUXT_GOPAY_ENV=mock` to the main checkout's `web/.env` once**:
  `.worktreeinclude` copies that file into every new worktree, and without the
  line the dev server refuses to boot.

- **Nuxt puts every env override through `destr`, so an all-digits secret
  arrives as a `number`.** `NUXT_GOPAY_GOID=8123456789` failed validation as
  "expected string, received number"; the schema now accepts `string | number`.
  Worth remembering for any future numeric-looking secret in runtime config.

- **Deviation from the spec, deliberate.** The spec says the schema rejects
  `mock` when `NODE_ENV=production`; it actually rejects `mock` whenever the
  build is not a dev build (`import.meta.dev`). `nuxi prepare` and `nuxi
typecheck` both run with `NODE_ENV=production` and would otherwise strip the
  mock out of the type graph during `check:all`. Same protection, one fewer way
  to get it wrong.

- **Nothing in this area has ever talked to the real GoPay.** The four calls are
  verified only against a stubbed `$fetch` — headers, URLs, bodies, token
  caching and its two-minute refresh. Closing that needs the sandbox credentials
  listed under Open Concerns plus one live create+inquire, and belongs in
  `../2026-09-15_gopay-go-live/`.

- **`vp run build` does not work in the Claude Code remote container**: the task
  loses the proxy environment and `@nuxt/fonts` dies with
  `SELF_SIGNED_CERT_IN_CHAIN`. `npx nuxi build` from `web/` is the same build and
  works. Likewise `playwright-cli` is a Vite+ global whose bin directory
  (`~/.local/share/vite-plus/bin`) is not on an agent shell's PATH, so the
  browser plugin's preflight reports it missing. Both recipes are now in the
  `run-jedlik-nejedlik` skill.

## Ticket 01 — Billing Details and the Service Account (STOPPED THE RUN)

Left at `status: in-progress`, criteria 1 and 5 ticked, 2/3/4/6 not. The chain
stops here: tickets 03–06 cannot be verified without what is missing below.

**Only a human can finish this.** The privileged Directus calls were refused by
the permission classifier, so the Service Account does not exist. To close it:
create the „Služby" role and its policy (`app_access: false`) with the
permissions ADR 0006 lists, the „Shop service" user, mint its static token into
`NUXT_SHOP_DIRECTUS_TOKEN` (and `DIRECTUS_PROBE_SHOP_TOKEN` for the probes), add
the Student `read` rule on `directus_users` (own row; `id`, `email`,
`billing_*`), then `vp run directus:pull` and `vp run directus:probe`.
`web/tests/probes/shop-service.probe.ts` unskips itself and is the acceptance
test. The exact list is in the ticket's "Left to apply on the instance" section.

- **What _is_ applied to production, and is recorded**: the six `billing_*`
  fields on `order` and on `directus_users`, the Student `order` create rule
  widened to accept the billing snapshot (permission 75), and the Student
  `directus_users` update rule widened from `[password]` to password + the six
  billing fields (permission 107). `vp run directus:diff` is clean, so the
  instance is not ahead of the dump.

- **Directus reads an updated row back through the read rules.** A Student's
  `PATCH /users/me` therefore answers **403** while the own-row read rule is
  missing, even though the update rule now permits the fields. This is measured
  against the instance, not inferred. Two assertions (own-row write, own-row
  read) are absent from `billing-details.probe.ts` for that reason, with a
  comment marking where they belong.

- **The app cannot boot on this branch until the token exists.** The
  runtime-config schema requires `shop.directusToken`, so `vp run dev` fails.
  That is spec-true — the checkout genuinely cannot work without it — but it is
  what blocks local verification for tickets 03–06. If that proves too costly
  before the account exists, the smallest fix is a dev-only exemption in
  `web/server/runtime-config.schema.ts`, mirroring the `import.meta.dev` branch
  ticket 02 already has there.

- **Real environment variable is `NUXT_SHOP_DIRECTUS_TOKEN`**, not
  `DIRECTUS_SHOP_TOKEN` as the spec and ticket say: the nested runtime-config key
  `shop.directusToken` snake-cases to `SHOP_DIRECTUS_TOKEN`, and Nuxt only maps
  `NUXT_`-prefixed variables. It also has to reach Coolify for deploys.

- **Unverified:** `shop-service.probe.ts` has never executed — the account it
  targets does not exist. Expect to fix small things in it on its first run.

- **`it.skip` fails the repo's lint** (`vitest/no-disabled-tests` under oxlint,
  enforced by `vp staged`); a conditional `describe.skipIf(...)` passes. Worth
  knowing before writing a gated probe.

## Open concerns carried from the spec (not resolved here, by decision)

- The terms page's withdrawal clause promises loss of the withdrawal right on
  consent in the order form; with no § 1837 checkbox the clause is dormant and
  wrong. Owner: site owner with the lawyer, area 10.
- GoPay sandbox credentials are not issued yet. Everything in this area runs and
  is verified against the mock gateway only; nothing here has ever talked to a
  real GoPay. Owner: site owner, tracked in `../2026-09-15_gopay-go-live/`.
- Whether Live Courses join the Catalog, and when SimpleShop is switched off,
  stays unscheduled. Owner: site owner.
