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

## Run 2 (2026-09-17): tickets 03–06

- The maintainer cleared all three Open Concerns at the gate without resolving
  them: the terms wording stays as it is for now, the mock gateway is enough
  until GoPay go-live, and SimpleShop is left alone because the Kurzy features
  are orthogonal to it. Recorded in the spec's Open Concerns too.
- The two corrections run 1 left behind are now in the spec: the shop token is
  `NUXT_SHOP_DIRECTUS_TOKEN` and every GoPay key carries the `NUXT_` prefix
  (that prefix is what reaches runtime config), and the Service Account's
  `course` read includes `title`.
- Ticket 06's stated gate is green: `vp run directus:probe` passes the
  `USER_REGISTER_URL_ALLOW_LIST` probe, so the instance setting is in place.

### 03 — Checkout for a logged-in Student (42a4fa1)

- **A repo-wide typing consequence, deliberate.** `Schema` now declares
  `directus_users: AccountUserCollection[]`
  (`web/layers/directus/shared/types/directus.ts`). Declaring that collection
  **replaces** the SDK's built-in system-user shape, which is the only way the
  `billing_*` columns become typed at all — but it also means any other
  `directus_users` column the app ever reads or writes has to be added to that
  interface or it will not typecheck. Today it lists `id`, `email`, `password`
  and the six billing columns. `OrderCollection.consents` was likewise widened
  from `number[]` to also accept `NewOrderConsent[]`, so the Order and its
  Consent go to Directus in one nested create.
- **Pre-existing site bug that will bite ticket 06 and any future form.**
  `web/app/assets/css/main.css` has `input, textarea { max-width: none;
width: 100% }`, which outranks Puleo's zero-specificity
  `:where(input[type="checkbox"]) { inline-size: var(--space-4) }` — a bare
  checkbox stretches to the full row width (measured 460 px). The Checkout works
  around it in its own scoped style; the honest fix is one exclusion in
  `main.css`, left alone as out of scope. Related trap found the same way:
  `--font-size-00` does not exist in the Puleo scale (`--font-size--2` …
  `--font-size-5`), and an undefined token fails silently by inheriting.
- **Decision where the spec was silent: the 409 is rendered by the page, not by
  the site's error page.** Nuxt's default error page would head the screen with
  `already_entitled`. The Checkout instead shows the route's Czech sentence in
  the new `<ShopNotice>` and never renders the form; the way onward depends on
  which refusal it is. The helper that reads it, `readRefusal`, is unit-tested.
- **Unverified until ticket 04, by design.** The Payment is created with
  `callback.return_url = /objednavka/<id>/navrat` and
  `callback.notification_url = /api/gopay/notify`; neither route existed yet, so
  pressing „Zaplatit" at the mock logged an unanswered notification and dropped
  the Student on a 404. Everything up to reaching the gateway is verified;
  settlement is ticket 04's to close.
- **Accepted limit in the Order-reuse check:** only the newest `created` Order
  that has a `gopay_payment_id` is inquired, so a checkout costs at most one
  GoPay round-trip. The reasoning is in the comment on `reusableOrder`.

### The per-ticket worktree fan-out was tried again, and failed again

Run 2 dispatched tickets 04 and 05 into their own worktrees and hit exactly the
limitation written up above: both implementers were pinned at launch to the task
worktree, `EnterWorktree` reported success, and then every Bash call was refused
in every directory. Ticket 05's implementer burned a full context window without
reaching the code; ticket 04's was stopped before it wrote anything. Neither
worktree nor branch survives.

The orchestrator half binds too, as the earlier note predicted: from inside the
task worktree, `git -C`, `git --git-dir` and any compound git command aimed at a
sibling worktree are refused, so §4.3's rebase-then-fast-forward cannot run.
`git worktree add` and `git worktree remove` with an absolute path are the two
that do work, which is only enough to create and clean up worktrees nobody can
use.

**Run the remaining tickets one at a time in the task worktree.** That is not a
preference; it is the only arrangement in which an implementer can run a check.

### 04 — Settlement, notification route, return page (dd77ef0)

- **Deviation from the spec's step order, deliberate and required; the spec is
  amended to match.** „Settlement" said „inquire GoPay; load the Order by
  `gopay_payment_id`". It is implemented the other way round: the Order is
  loaded first, and GoPay is only asked about a Payment some Order actually
  carries. Inquire-first makes a forged notification throw (the gateway does not
  know the id) and answer 500 with a Sentry event, which contradicts this
  ticket's own „unknown id answers 200 and writes nothing" and defeats user
  story 32's „cannot be used to spam GoPay's API". Reasoning is in the comment
  on `settlePayment`.
- **Deviation, small: the mock gateway gained a third action.**
  `POST /api/gopay/mock/payments/<id>/decide` accepts `{"action":"choose"}` →
  `PAYMENT_METHOD_CHOSEN`, with no button on the page (the spec's two buttons
  are unchanged). Without it the criterion naming that state cannot be observed
  at all. The recipe is in the `run-jedlik-nejedlik` skill.
- **Decision where the spec was silent: the return page does not surface a
  settlement failure.** If the GoPay inquiry throws on the return route, it logs
  a warning and renders the Order as it stands (pending) rather than erroring.
  The notification route is the alarm path — GoPay retries it up to twenty times
  and it is the one that reports to Sentry. A Student should not meet an error
  page over a slow gateway.
- **Decision where the spec was silent: the return route takes the Payment id
  from the Order, not from `?id=`.** GoPay appends `?id=` itself and the page
  ignores it. The Order is read with the Student's own session, so ownership is
  Directus's decision and a foreign or unknown id is the same 404. Nothing the
  browser sends is trusted.
- **Sentry delivery was not observed, only the call.** The forced-failure run
  answered 500 and logged from the same catch block one line below
  `Sentry.captureException`, but nothing local can see the event land in
  Sentry's UI. Closing that needs someone to look at the Sentry project after a
  deliberate failure on a deployed instance.
- `shop-service.probe.ts` still skips: `DIRECTUS_PROBE_SHOP_TOKEN` is not in
  `web/.env`. Pre-existing, from ticket 01.
- The Service Account's token is now exercised end to end by a running request,
  closing the gap ticket 01 left open. Nothing here has still ever talked to a
  real GoPay.
