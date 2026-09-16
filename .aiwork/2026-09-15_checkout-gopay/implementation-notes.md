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

## Open concerns carried from the spec (not resolved here, by decision)

- The terms page's withdrawal clause promises loss of the withdrawal right on
  consent in the order form; with no § 1837 checkbox the clause is dormant and
  wrong. Owner: site owner with the lawyer, area 10.
- GoPay sandbox credentials are not issued yet. Everything in this area runs and
  is verified against the mock gateway only; nothing here has ever talked to a
  real GoPay. Owner: site owner, tracked in `../2026-09-15_gopay-go-live/`.
- Whether Live Courses join the Catalog, and when SimpleShop is switched off,
  stays unscheduled. Owner: site owner.
