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

## Ticket 01 — Billing Details and the Service Account

Done, `verified: [checks, probes, behaviour]`. The instance changes were applied
partly by
the implementer and partly by hand (see "Where the run stopped" below); they are
all recorded in `directus/config/**` and `vp run directus:diff` is clean.

- **The env var is `NUXT_SHOP_DIRECTUS_TOKEN`**, not `DIRECTUS_SHOP_TOKEN` as the
  spec and the ticket say: the nested runtime-config key `shop.directusToken`
  snake-cases to `SHOP_DIRECTUS_TOKEN`, and Nuxt only maps `NUXT_`-prefixed
  variables. **It must also be set in Coolify** for the deployed site; the token
  is stored hashed in Directus and is in no dump, so if it is lost it has to be
  rotated in the admin app.

- **Adding the Student's own-row read rule changed four `auth.probe.ts`
  expectations, and that is a fix rather than a regression.** Directus answers a
  `PATCH` with the updated row (200) once the caller may read it back, and with a
  bare 204 — or a misleading 403 — when it may not. One of those probes was
  literally named "answers PATCH /users/me with 403 even though it wrote the
  password", with the comment "the 403 is a lie". `/users/me` is now honest. The
  probes were rewritten to the new contract and the stale comments corrected.
  All three security properties are still asserted and still hold: the old
  password stops working and the new one works (now checked for both write
  spellings, which the old `/users/me` test never did), a change still signs out
  every session including the current one, and another Student's row stays
  unreadable and unwritable.

- **Decision where the spec was silent:** the password-change route keeps
  `PATCH /users/:pk` rather than switching to `/users/me`, even though
  `/users/me` now works. The by-id form does not depend on the new read rule,
  while `/users/me` would silently revert to "403 over an already-written
  password" if that rule were ever narrowed — a password change is the wrong
  place to discover that. The saving would have been one round-trip. The
  `/users/me` contract is pinned by a probe, so the simplification stays
  available.

- **Contradicts the spec and ADR 0006:** the Service Account's `course` read
  covers `id, slug, price_czk, status, title`. Both documents listed only the
  first four, but GoPay's `order_description` needs the title, so the instance is
  right. The ADR was corrected; **the spec's Implementation Decisions section
  still lists four and should be amended.** The account's `order` read likewise
  includes the `billing_*` snapshot, which area 05 invoices from.

- **The behaviour pass is the account page's password change** (`/muj-ucet`),
  driven in the dev server against the live instance with a throwaway Student.
  It is the one runtime surface this ticket moved: the route's Directus call now
  gets a 200 where it used to get a 204. Wrong current password → „Současné heslo
  není správné." and nothing written; correct one → „Heslo bylo změněno…", the
  session survives a reload (the route's re-login still works), the old password
  is refused at the login page and the new one is accepted. Screenshots in
  `screenshots/01-ticket01-password-change-*.png`. Booting the dev server at all
  is part of the evidence: the runtime-config schema requires
  `shop.directusToken`, so it could not start before the token existed.

- **Finding, pre-existing and not this ticket's:** after a _successful_ password
  change both fields are cleared while still `required`, so `:user-invalid`
  paints them red — a success banner above two red-outlined inputs. Visible in
  both screenshots. Nothing in this ticket touches a template or a stylesheet;
  tickets 03 and 05 build more forms in this style and could fix it once for the
  auth layer.

- **Unverified:** the runtime path that actually uses the Service Account token
  has never run end to end. The probes prove the permission matrix from outside,
  not that Nitro uses it correctly. That closes in ticket 04.

- **`it.skip` fails the repo's lint** (`vitest/no-disabled-tests` under oxlint,
  enforced by `vp staged`); a conditional `describe.skipIf(...)` passes. Worth
  knowing before writing a gated probe.

- **Probes should not lean on incidental instance data.**
  `shop-service.probe.ts` originally inferred "the Order read is not row-filtered"
  from the instance happening to hold Orders from more than one Student, and went
  red as soon as that stopped being true. It now seeds two throwaway Students with
  an Order each and cleans up after itself. Anything else resting on live data
  deserves the same treatment.

### Where the run stopped, and why it needed a human

The permission classifier refuses bulk Directus permission grants, and escalates
to a hard denial after a couple of similar calls. Two agent sessions hit it. The
role, policy, its six permission rules, the Student read rule and the „Shop
service" user were finished by hand from the orchestrator session and a
user-run script. If this has to be redone on a fresh instance, expect to do it
manually — the ADR's "Consequences" section already says the account is not
reproducible from the repository, and the token never is.

A caution for anyone writing that script: grants are **not** idempotent.
Directus happily inserts a duplicate permission row for the same
policy + collection + action, so a re-run after a partial failure silently
doubles every rule that already landed. Check for the existing rule before
creating it, and put the "does the user already exist" guard _before_ the
grants, not after.

## Where this run ended

Stopped deliberately after ticket 01, at the maintainer's request — not because
of a blocker. **Tickets 03, 04, 05 and 06 were never started**, so the spec's
wrap-up (`/simplify`, `/code-review xhigh`, a full `/verify` over the branch,
`review.md`) has not run either. The spec stays `in-progress`: it is neither
blocked nor agent-done.

Done: **02** (GoPay client and mock gateway) and **01** (Billing Details and the
Service Account). Both carry `status: done` with every acceptance criterion
ticked and the passes that actually ran in `verified:`.

What the next session inherits, in the order the `blocked_by` graph allows:

1. **03 — Checkout for a logged-in Student.** Unblocked now: both its blockers
   are done and the dev server can finally boot, because
   `NUXT_SHOP_DIRECTUS_TOKEN` exists. It owns the Billing Details form component
   and the shop layer's shared notice component, per the orchestration decisions
   at the top of this file.
2. **04** and **06** follow 03; **05** was deliberately held behind 03 for the
   form component.

Two corrections to make to the spec while you are in there, both found by
implementers and both recorded above: every `GOPAY_*` and the shop token need
the `NUXT_` prefix to reach runtime config, and the Service Account's `course`
read includes `title`.

Nothing in this area has ever talked to a real GoPay, and the Service Account's
token has never been exercised by a running request — only by the probes, from
outside. Ticket 04 is the first thing that closes the second gap; the first
needs GoPay sandbox credentials and belongs to `../2026-09-15_gopay-go-live/`.

## Open concerns carried from the spec (not resolved here, by decision)

- The terms page's withdrawal clause promises loss of the withdrawal right on
  consent in the order form; with no § 1837 checkbox the clause is dormant and
  wrong. Owner: site owner with the lawyer, area 10.
- GoPay sandbox credentials are not issued yet. Everything in this area runs and
  is verified against the mock gateway only; nothing here has ever talked to a
  real GoPay. Owner: site owner, tracked in `../2026-09-15_gopay-go-live/`.
- Whether Live Courses join the Catalog, and when SimpleShop is switched off,
  stays unscheduled. Owner: site owner.
