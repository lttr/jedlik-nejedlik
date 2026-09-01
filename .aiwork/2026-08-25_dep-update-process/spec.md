---
status: done
references:
  - "ADR: docs/adr/0003-pnpm-native-dependency-updates.md"
  - "Research: ~/code/research/research/agentic-dependency-updates/README.md"
  - "Prior art: .aiwork/2026-05-01_dep-update/plan.md"
---

# Weekly agentic dependency updates

## Problem Statement

Dependencies on this site drift until an upgrade becomes a project. The last
attempt (`.aiwork/2026-05-01_dep-update/plan.md`) shows the shape of the pain:
nine packages behind, four majors, release notes to read by hand, an upgrade
order to work out, and three open questions that stalled it. Doing that by hand
means it happens rarely, which makes each round bigger and riskier than the
last.

The parts that hurt are not the parts a machine can't do. Deciding what may be
upgraded, applying the bump and running the checks are all mechanical. The one
genuinely hard part — "this API is gone, now what" — is exactly the part that
has never had a tool, and it is what stalls the whole thing.

Meanwhile the release-age risk is real, and pnpm is the only thing guarding it
today. That matters more here than in most projects: merging to `master` deploys
straight to production through Coolify, with no staging in between.

## Solution

Every Monday a Claude Code cloud routine wakes up, reads what pnpm says is
outdated, upgrades what is safe to upgrade, works out and applies whatever code
changes the new versions need, runs the full verification suite, and leaves one
ready-to-review pull request behind. Nothing runs on the maintainer's laptop and
nothing depends on it being awake.

What arrives is a PR with two commits: the bumps and lockfile, and the code
changes the new versions required. Only the second commit needs human eyes. The
PR body carries the verification result, changelog links, per-bump notes where
a bump deserved one, and — the part that makes a single review pass honest —
an explicit list of what the run could _not_ check.

The maintainer's job is one weekly decision: read the second commit and the
"Not verified" list, then merge, close, or ignore. A PR left open just skips
the next run; a stale one is closed by hand.

## User Stories

1. As the maintainer, I want dependencies checked every week automatically, so
   that upgrades stay small instead of accumulating into a project.
2. As the maintainer, I want the check to run in the cloud, so that it happens
   whether or not my laptop is on.
3. As the maintainer, I want newly published versions held back for a day, so
   that a compromised release has a chance to be pulled from the registry before
   it can reach my lockfile.
4. As the maintainer, I want the release-age gate enforced by the package
   manager rather than by the agent's good intentions, so that it applies on
   every install regardless of who ran it.
5. As the maintainer, I want routine bumps batched into one PR, so that weekly
   noise costs me one review, not ten.
6. As the maintainer, I want a major that demands real code changes in its own
   PR, at most one per week, so that a migration is never buried inside routine
   noise.
7. As the maintainer, I want the remaining majors listed as queued in the batch
   PR, so that I know what is waiting without going to look.
8. As the maintainer, I want the Nuxt ecosystem upgraded as one group, so that I
   never get a PR that cannot pass CI because half the ecosystem moved.
9. As the maintainer, I want code changes isolated from the version bumps in
   the final commit, so that the only thing needing judgement is also the only
   thing I have to read.
10. As the maintainer, I want `vp run verify:all` green before a PR is opened —
    or the failure stated plainly at the top of the PR body when the run had to
    hand over — so that I never have to discover a red build myself.
11. As the maintainer, I want an explicit list of what the run could not verify,
    so that I know the review's blind spots rather than trusting a green tick.
12. As the maintainer, I want a single verification failure to cost me only the
    offending package, so that one bad bump does not block nine good ones.
13. As the maintainer, I want dropped packages reported as deferred, so that a
    problem package is visible rather than silently skipped forever.
14. As the maintainer, I want repair attempts bounded, so that the run stops and
    hands over instead of thrashing and producing a destructive diff.
15. As the maintainer, I want a run that finds a dependency PR already open to
    skip and say so, so that I never face a queue of bot PRs.
16. As the maintainer, I want the run to leave a trace even when there is nothing
    to update, so that silence never has to be interpreted.
17. As the maintainer, I want exact-pinned packages left alone but reported when a
    newer version exists, so that a deliberate pin is never "helpfully" bumped.
18. As the maintainer, I want the documented `DELETE-WHEN` workarounds in
    `pnpm-workspace.yaml` re-checked weekly and only ever reported, never
    removed, so that temporary workarounds neither become permanent nor get
    unwound without me.
19. As the maintainer, I want the routine to hold no credentials beyond a public
    URL, so that a compromised environment leaks nothing.
20. As the maintainer, I want every MCP connector stripped from the routine and
    its network reach limited to the package registries, GitHub and the Directus
    host, so that a dependency job can never write to the CMS.
21. As the maintainer, I want the process paused with one toggle, so that I can
    stop it without dismantling the configuration.
22. As the maintainer, I want the judgement committed to the repo as a skill I
    can also invoke from my terminal, so that I can test a change to the process
    without waiting for Monday, and move it to CI later without rewriting it.
23. As a future maintainer, I want to know why there is no Renovate here, so
    that I do not "fix" its absence.

## Implementation Decisions

**Architecture — agent owns the PR.** Of the four architectures in the research,
this is C: a scheduled job does decide / apply / repair / verify end to end and
opens its own PR. Renovate is not used; the reasoning and the accepted costs are
recorded in ADR 0003. Consequence: nothing else owns the branch, so there is no
ownership handoff to design around.

**Version oracle — pnpm.** `pnpm outdated --format=json` is the work list.
`minimumReleaseAge` stays at pnpm 11's default of **1440 minutes (24 hours)** —
no configuration line is added, because the default is already the policy.
`minimumReleaseAgeExclude` is written only by `pnpm audit --fix`; the process is
forbidden from hand-editing it.

**Scope of updates.** Direct dependencies in both workspace packages, majors
included (`--latest`) for anything not explicitly pinned, plus a periodic
`pnpm dedupe`. Out of the automation's reach, reported only: exact pins
(`@nuxtjs/seo`, `directus-sync`, `rolldown`), the `catalog:` aliases that resolve
`latest` on every install (`vite`, `vitest`, `vite-plus`), and the `overrides` /
`peerDependencyRules` workarounds. The four documented `DELETE-WHEN` conditions
in `pnpm-workspace.yaml` are evaluated each week and reported as satisfied or not.

**Batching — impact decides, not the semver digit.** One PR for the batch. A
major whose breaking changes provably do not touch this codebase — the agent
reads the breaking-change list and greps our usage — rides in the batch, flagged
in the PR body with the evidence. A major that demands real code changes gets
its own PR, at most one per run; further such majors are listed as queued.
Nuxt, `@nuxt/*`, `vue`, `vue-router`, `nitropack` and the vite/vitest catalog
entries are treated as one indivisible group. When a package ships a codemod or
migration CLI, the agent finds and runs it as part of the work rather than
re-deriving the changes by hand.

**One PR at a time.** If an open PR on a `claude/deps-*` branch already exists,
the run skips: it leaves a note in the weekly `.aiwork/` folder and stops. What
happens to the open PR — merge, close, or ignore — is the maintainer's call;
nothing rebases or supersedes it.

**Branch and PR.** Branch `claude/deps-{ISO-week}` — the `claude/` prefix is
what cloud sessions are unconditionally allowed to push. Title `deps: safe batch
{week}` or `deps: {package} {from}→{to}`, label `deps`, body in English. No
draft/ready choreography: the PR opens as a normal PR, and the body's first line
states the verification result. A run that had to hand over says so at the top.

**Commit contract.** Two commits, never amended: (1) `package.json` +
`pnpm-lock.yaml`, its body recording the exact commands that produced it, and
(2) the code changes the new versions required — codemod output and hand repairs
alike. Skipped when no code changes are needed. Commits go through the existing
`vp staged` pre-commit hook; `--no-verify` is already denied in
`.claude/settings.json`.

**Failure handling.** On verification failure in the batch: identify the
offending package, drop it, re-verify, ship the rest. Bounded at **2 drops and 3
verify cycles per problem**, then stop and hand over — open the PR with the
failure stated at the top. A migration PR has nothing to bisect, so it hands
over directly. Forbidden moves, stated in the skill: never edit or skip a test
to make it pass, never widen a version range to dodge a peer conflict, never
touch files unrelated to the upgrade, never hand-edit
`minimumReleaseAgeExclude`, never remove a workspace workaround.

**Nuxt-specific rule.** Auto-imports have no import statement, so "find all
usages" means ripgrep or LSP references, never an import graph. The skill states
this explicitly because it is a confident-wrong failure mode.

**Trigger and portability.** A Claude Code cloud routine on a weekly Monday
schedule. All judgement lives in a committed skill, invoked as
`/dependency-update`, so the same body runs from the routine, from a GitHub
Action later, or from the maintainer's terminal. The routine's prompt is one
line.

**Cloud environment.** A dedicated environment, not Default. Network access
Custom = default allowlist plus `obsah-jedlika.lttr.cz`. Environment variables:
`NUXT_PUBLIC_DIRECTUS_URL` only — cloud environments have no secrets store and
their values are readable by anyone using the environment, so no tokens go in.
Consequence: `verify:build` must succeed without `SENTRY_AUTH_TOKEN` (sourcemap
upload skipped); if it does not, that is a bug to fix in the build, not a reason
to add the credential. Setup script installs Node 24.15.0 and pins pnpm 11.2.2
via corepack, then runs `pnpm fetch` to warm the content-addressed store; the
actual install is left to the repo's existing `session-bootstrap.sh`
SessionStart hook so the lockfile the run is about to change stays
authoritative. Every MCP connector is removed from the routine. Open item to
confirm on the first run: the scan helper needs `registry.npmjs.org` and
`api.github.com` reachable, and the default allowlist has not been checked for
them — if either is missing it joins `obsah-jedlika.lttr.cz` in the Custom list.

**Code layout.** Two new pieces:

- `.claude/skills/dependency-update/SKILL.md` — all judgement: what to read,
  impact assessment for majors, migration discovery, repair loop, stall and
  forbidden rules, PR body contract.
- `.claude/skills/dependency-update/scripts/dep-scan.mjs` — the deterministic
  scan, and nothing more: run `pnpm outdated --format=json` and normalise its
  recursive and non-recursive shapes, tag each row against
  `pnpm-workspace.yaml` (exact pin, `catalog:` alias, override workaround —
  out-of-scope rows would otherwise surface as permanent phantom "outdated"
  entries), list the `DELETE-WHEN` conditions, and resolve each package to its
  GitHub repo (local `node_modules/<pkg>/package.json` first, npm registry as
  fallback). Output is one JSON blob for the skill to read. It lives beside
  `SKILL.md` rather than in `scripts/` so the helper and the judgement that
  calls it are versioned together.

The helper does **not** fetch release notes. The skill fetches them itself,
per package and only for bumps that warrant reading — minors of consequential
packages, anything in the Nuxt group, and every major — via
`gh api repos/{repo}/releases` (authenticated, so the 60-requests/hour
unauthenticated ceiling never applies). Two rules govern the reading: the
tag-to-package guard — Nuxt, Vite and Vue tag per package
(`@nuxt/kit@4.2.0`), so releases must be matched to the package, not compared
as bare versions — and the thin-changelog rule carried over from the prior
`npm-dep-update` skill: when release notes are missing or thin for a
significant jump, fetch the actual changelog URL rather than reasoning from
the version number alone. The prior skill's interactive workflow is otherwise
not reused; its repo-resolution logic is the prior art for `dep-scan.mjs`.

Weekly notes land in `.aiwork/{date}_dep-update/` and are committed as part of
commit 1.

**Dependencies.** No new runtime or dev dependency. `pnpm`, `gh`, `jq` and
ripgrep are all available in the cloud sandbox; the scan helper is a plain Node
ESM script using `fetch`, so it needs nothing installed.

## Testing Decisions

**No automated tests for this work.** The unit of value here is a pull request
that a human can review and merge, and that is not something a test suite can
assert. Mocking a registry snapshot to prove that a classifier splits a list
correctly would test the shape of the code rather than the thing that matters,
and it would pin down internals the first real Monday is likely to change.

**The test is running it.** Validation is practice: invoke `/dependency-update`
by hand from the terminal against a throwaway branch, read the PR it produces,
and fix what is wrong in the skill. Repeat until the PR is one you would merge.
Then schedule the routine and watch the first two real Mondays, treating each
resulting PR as the evidence.

**What "passing" looks like.** The PR opens on a `claude/deps-*` branch, carries
two commits in the agreed order, states the commands behind commit 1, the body
opens with an honest verification result, any major riding in the batch carries
its no-impact evidence, the "Not verified" list is honest rather than
reassuring, and the pins and `DELETE-WHEN` conditions are reported without
being touched.

**What a failure looks like, and what to do.** A PR that is tiring to read means
the batch is too big. A PR that claims everything is fine means the skill's
honesty rules are too weak. A run that thrashes means the stall bound is not
biting. Each of these is a fix to `SKILL.md`, which is why all the judgement
lives there rather than spread across scripts.

**Existing checks still apply.** `vp run verify:all` runs inside every run and
is the machine gate on the code the process produces; the `vp staged`
pre-commit hook formats and lints each commit. Those are not new tests, they
are the ones already in place doing their job.

## Out of Scope

- **Renovate in any mode**, including dashboard-only. ADR 0003 records why and
  leaves the door open.
- **A GitHub Actions CI workflow.** Verification runs inside the routine for now.
  Adding CI as an independent second gate is a later, separate decision.
- **Automerge.** Every dependency PR is merged by a human, because merging
  deploys to production.
- **A post-merge deploy check.** The maintainer merges by hand and watches the
  deploy (the `monitor-deploy` skill exists for that); the run does not
  re-derive it.
- **Transitive-only and security-driven updates.** `pnpm audit --fix` stays a
  manual action; this process does not respond to advisories.
- **Directus, Coolify or other infrastructure updates.** npm dependencies only.
- **Removing any `pnpm-workspace.yaml` workaround**, even when its `DELETE-WHEN`
  condition is reported as satisfied.
- **Multi-repo support.** This routine covers this repository only.

## Further Notes

The research this is built on argues that the failure mode to design against is
not a bad agent but a bored human: PR size predicts post-merge defects, and an
approval queue decays into rubber-stamping. Nearly every constraint above — one
PR at a time, one migration per week, two commits with only the second needing
eyes, the mandatory "Not verified" list — exists to keep the weekly review
small enough to actually perform. If the process starts producing PRs that are
tiring to read, that is the signal to shrink the batch, not to read faster.

The second thing to watch is that merging is deploying. Nothing after the merge
button is automated here — the maintainer watches the deploy — so a merge is a
commitment, not a hand-off.

Deliberately deferred until real Mondays supply data: any digest or
token-budget machinery around release notes (the skill reads lazily instead),
draft/ready PR states, and automated post-merge checks. Each was in an earlier
draft of this spec and was cut as a v1 speciality; the shapes are recoverable
from git history if practice shows they earn their keep.
