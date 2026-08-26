---
name: dependency-update
description: Weekly dependency update run — read what pnpm says is outdated, upgrade what is safe, apply the code changes the new versions need, verify, and open one reviewable PR. Supports a read-only dry run that reports what it would do. Use when the user says "dependency update", "/dependency-update", "update deps", "dry run the dep update", or when the weekly cloud routine fires.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch
---

# Dependency update

One run produces at most one pull request. Everything here is judgement; the
only deterministic part lives in `scripts/dep-scan.mjs`.

Background: `docs/adr/0003-pnpm-native-dependency-updates.md` (why no Renovate),
`.aiwork/2026-08-25_dep-update-process/spec.md` (why each rule exists).

Merging this PR deploys to production. Nothing here is automerged, so the value
of the run is a PR a tired human can review honestly in a few minutes — not the
largest batch that passes CI.

## Modes

Default is the **full run**: it branches, bumps, verifies and opens a PR.

**Dry run** — triggered by `/dependency-update dry-run`, or any phrasing like
"dry run", "just report", "what would you update", "no changes". It runs §0–§3
only and then prints the report in §3a. It is strictly read-only:

- Allowed: `git fetch`, `gh pr list`, the scan script, `gh api` release notes,
  WebFetch, and read-only searches of our source (the evidence work in §3).
- Forbidden: `git switch -c`, any `pnpm update`/`pnpm dedupe`/install that could
  rewrite `package.json` or `pnpm-lock.yaml`, any source edit, any commit, any
  push, `gh pr create`, and the weekly note in §7. A dry run leaves the working
  tree exactly as it found it — say so at the end of the report.
- `vp run verify:all` is **not** run: nothing changed, so it proves nothing. The
  report says the batch is unverified rather than implying it is green.

Everything else — the scope rules, the tag-to-package guard, the impact-not-digit
rule, the Nuxt-group rule — applies unchanged. A dry run that skips reading
release notes is worthless; the whole point is the reasoning, not the list.

## 0. Preflight — stop conditions

Run these first. If any stop condition holds, do the stated thing and end the
run; do not "work around" it.

```bash
git fetch origin --quiet
gh pr list --state open --json number,title,headRefName \
  --jq '[.[] | select(.headRefName | startswith("claude/deps-"))]'
```

- **A dependency PR is already open** → do not rebase, supersede or close it.
  Write the weekly note (§7) saying which PR is open, say so in the final
  message, stop. What happens to that PR is the maintainer's call. In a dry run
  this is not a stop: name the open PR at the top of the report, note that a
  real run would stop here, and carry on scanning — the report costs nothing.
- **Working tree dirty, or HEAD is not an ancestor of `origin/master`** → stop
  and say so. This run only ever starts from a clean, current `master`. A dry
  run continues, flagging that the scan reflects the dirty tree.
- **`node_modules` missing** → the `session-bootstrap.sh` SessionStart hook
  installs. Do not hand-run an install that would rewrite the lockfile before
  the scan.

Set the week identifier once and reuse it:

```bash
WEEK=$(date +%G-W%V)   # e.g. 2026-W35
TODAY=$(date +%F)
```

## 1. Scan

```bash
node .claude/skills/dependency-update/scripts/dep-scan.mjs > /tmp/dep-scan.json
jq '.counts, .deleteWhen' /tmp/dep-scan.json
```

The blob holds one row per outdated direct dependency per workspace, with
`declared` (the range in `package.json`), `bump` (`patch`/`minor`/`major`,
0.x-aware), `inScope`, `outOfScopeReason` and `repo`.

- `inScope: false` rows are **report only**: exact pins, `catalog:` aliases,
  `npm:` aliases and packages covered by a `pnpm-workspace.yaml` override. Never
  bump them. They go in the PR body's "Reported, not touched" section.
- `deleteWhen` lists the documented workarounds. Evaluate each condition against
  what you learned reading release notes and report it as satisfied or not.
  **Never remove a workaround**, even when its condition is satisfied.
- `counts.inScope == 0` → nothing to do. Write the weekly note (§7), say so,
  stop. Silence is never the answer; the note is the trace. A dry run writes no
  note: it prints the §3a report with empty "Would bump" / "Would defer"
  sections and the out-of-scope rows still listed.

## 2. Read release notes — only where they earn it

Fetch per package, lazily. Read notes for: **every major**, every package in the
Nuxt group, and minors of consequential packages (anything that touches build,
lint, types, runtime rendering or the Directus SDK). Patch bumps and icon data
(`@iconify-json/*`) need no reading.

```bash
gh api repos/{owner}/{repo}/releases --paginate --jq \
  '.[] | select(.draft==false and .prerelease==false) | {tag: .tag_name, body: .body}' | head -c 40000
```

`gh` is authenticated, so the unauthenticated 60/hour ceiling never applies.

Two rules:

- **Tag-to-package guard.** Nuxt, Vite and Vue tag per package
  (`@nuxt/kit@4.2.0`, `nuxt@4.5.2`). Match releases to _this_ package by name;
  never compare bare version numbers across a monorepo's tags, or you will read
  another package's breaking changes as your own.
- **Thin-changelog rule.** When notes are missing or thin for a significant
  jump, fetch the actual changelog (`CHANGELOG.md` on the default branch, or the
  project's migration guide) with WebFetch rather than reasoning from the
  version number. Rows with `repo: null` have no GitHub source — use
  `https://www.npmjs.com/package/<name>?activeTab=versions`.

## 3. Decide the shape of the run

**Impact decides, not the semver digit.**

- A **major whose breaking changes provably do not touch this codebase** rides
  in the batch. "Provably" means: you read the breaking-change list, and for
  each item you searched our source and found nothing. Record the evidence
  (the item, the search, the result) — it goes in the PR body.
- A **major that demands real code changes** gets its own PR, at most one per
  run. Further such majors are listed as queued in the batch PR and left alone.
- The **Nuxt group is indivisible**: `nuxt`, `@nuxt/*`, `@nuxtjs/*`, `vue`,
  `vue-router`, `nitropack` and the vite/vitest catalog entries move together or
  not at all. Never ship half of it.
- When a package ships a **codemod or migration CLI**, find it in the release
  notes and run it instead of re-deriving the changes by hand.

Prefer the batch PR when both are possible: a migration PR costs a week of the
one-PR-at-a-time budget.

## 3a. Dry-run report — and then stop

A dry run ends here. Print the report to the user as chat output (no file, no
commit); if it is long, that is fine — nothing else will carry this information.

```markdown
# Dependency update — dry run ({week}, {today})

Read-only: no branch, no install, no lockfile change, no commit, no PR.
Working tree untouched. Nothing was verified — `vp run verify:all` was not run.

## Available updates ({counts.total})

| package | workspace | declared | current | latest | bump | in scope |

## Would bump ({n})

<one row per package: name, current → latest, bump, and the one-line reason it
is safe. For each major in the batch: the breaking-change items, the search run
for each, and the result — the same evidence a real run would put in the PR.>

## Would not bump

<one row per package, each with its reason, grouped:
 - out of scope (`outOfScopeReason` verbatim: exact pin, catalog alias, npm
   alias, override workaround)
 - major needing code changes — queued, or picked as this run's migration
 - held for another reason (Nuxt group incomplete, release notes unread because
   the source was unreachable, known-bad release, etc.)>

## Would do

<the concrete plan, in order:
 - the exact `pnpm update --latest ...` commands, verbatim, as §4 would run them
 - shape of the run: batch PR, or migration PR for <package> with the batch
   queued behind it
 - the code changes expected in commit 2, per API — or "none expected"
 - the codemod/migration CLI to run, if the notes name one
 - branch name and PR title>

## DELETE-WHEN status

<each condition from pnpm-workspace.yaml: satisfied / not satisfied, and why.
Report only — a dry run removes nothing, and neither would a real run.>

## Would not be verified

<what even a real run could not check: runtime behaviour against the live CMS,
visual rendering, anything only production exercises.>
```

Close with the one thing worth the user's attention and offer the real run.
Do not proceed to §4 unless the user asks for it in a new message.

## 4. Branch and apply

```bash
git switch -c claude/deps-$WEEK    # migration run: claude/deps-$WEEK-<package>
pnpm update --latest <pkg> <pkg> ...        # root workspace packages
pnpm --filter web update --latest <pkg> ... # web workspace packages
pnpm dedupe                                  # when the lockfile gained duplicates
```

Always name the packages explicitly — a bare `pnpm update --latest` would walk
into the out-of-scope rows. Record the exact commands you ran; commit 1's body
must quote them verbatim.

Then **commit 1 — bumps only**:

```
deps: batch update $WEEK

<one line per bump: name current → latest>

Produced by:
  pnpm update --latest ...
  pnpm --filter web update --latest ...
```

Contents: `package.json`(s), `pnpm-lock.yaml`, and the weekly note from §7.
Nothing else. Commits go through the `vp staged` pre-commit hook; `--no-verify`
is denied in `.claude/settings.json` and stays denied.

## 5. Repair the code

Only now touch source. Codemod output and hand repairs both land here, and they
become **commit 2** — the only commit the maintainer has to read:

```
deps: adapt code to <package> <version>

<what changed and why, one bullet per API>
```

Skip commit 2 entirely when no code changes were needed.

**Nuxt auto-imports have no import statement.** "Find all usages" means
`rg '\bmyComposable\b' web/app web/server` or LSP references — never an import
graph, never "no import found, so it is unused". This is a confident-wrong
failure mode; assume the symbol is used until ripgrep says otherwise.

## 6. Verify, and the repair loop

```bash
vp run verify:all
```

This is the gate. Never run the sub-checks standalone, never pipe the command
through `head`/`grep` (it swallows the exit code).

On failure in a **batch** run:

1. Identify the offending package (the failure text usually names it; otherwise
   bisect by dropping the most suspicious bump).
2. Drop it — revert its `package.json` entry and re-run the install so the
   lockfile matches — and re-verify.
3. Bounds: **at most 2 drops and 3 verify cycles per problem.** Hitting either
   bound means stop and hand over: open the PR with the failure quoted at the
   top of the body. Do not keep trying.

A **migration** run has nothing to bisect: on failure, hand over directly with
the failure at the top.

Every dropped package is reported as deferred in the PR body — a problem package
must be visible, never silently skipped.

If commit 1 already exists when a drop happens, amend nothing: add the revert to
commit 1 by rewriting it only if it has not been pushed, otherwise let the drop
be its own commit and say so in the body.

**Forbidden, without exception:**

- Never edit, skip, or weaken a test to make verification pass.
- Never widen a version range to dodge a peer conflict.
- Never touch files unrelated to the upgrade.
- Never hand-edit `minimumReleaseAgeExclude` (only `pnpm audit --fix` writes it).
- Never remove or edit a `pnpm-workspace.yaml` workaround, override, catalog
  entry or pin.
- Never bump an `inScope: false` row.
- Never `git push --force` this branch or amend a pushed commit.

## 7. Weekly note

`.aiwork/{TODAY}_dep-update/notes.md`, committed as part of commit 1 (or on its
own when the run stops early). Keep it short: what the scan found, what was
bumped, what was deferred and why, DELETE-WHEN status, and the outcome. A run
that did nothing still writes this file — it is the trace that makes silence
readable.

## 8. Open the PR

```bash
git push -u origin claude/deps-$WEEK
gh pr create --label deps --title "deps: safe batch $WEEK" --body-file <file>
```

Title: `deps: safe batch {week}` or, for a migration, `deps: {package} {from}→{to}`.
Body in English, first line the verification result. Body contract:

```markdown
✅ `vp run verify:all` green. <!-- or: ❌ HANDED OVER — verify:all failed, see below -->

## Bumps

| package | from | to | notes |

## Majors in this batch

<package: the breaking-change items, the search run for each, and the result>

## Code changes

<one line per change, or "none — commit 2 absent">

## Deferred

<dropped packages with the failure, and majors queued for a later run>

## Reported, not touched

<exact pins, catalog aliases, override workarounds — with the newer version available>

## DELETE-WHEN status

<each condition from pnpm-workspace.yaml: satisfied / not satisfied, and why>

## Not verified

<what this run could NOT check — e.g. runtime behaviour of the Directus SDK
against the live CMS, visual rendering, anything only production exercises>
```

The **Not verified** list is mandatory and must be honest. A PR that claims
everything is fine is a failure of this skill, not a good week. If the list is
hard to write, that is the signal the batch was too large.

Finish by telling the user the PR URL and the one thing worth their attention.

## 9. Running as the weekly cloud routine

The judgement above is the whole process; the trigger is interchangeable. The
Claude Code cloud routine runs weekly on Monday with a one-line prompt
("Run the `/dependency-update` skill.") in a dedicated environment:

- Environment variables: `NUXT_PUBLIC_DIRECTUS_URL` only. Cloud environments
  have no secrets store and their values are readable by anyone using the
  environment, so no tokens go in. `verify:build` must therefore succeed without
  `SENTRY_AUTH_TOKEN` (sourcemap upload skipped) — if it does not, that is a bug
  in the build, never a reason to add the credential.
- Network access: Custom = default allowlist plus `obsah-jedlika.lttr.cz`. The
  scan also needs `registry.npmjs.org` and `api.github.com`; add them to the
  Custom list if a run shows them blocked.
- Every MCP connector is removed from the routine. A dependency job must not be
  able to write to the CMS.
- Setup script installs Node 24.15.0, pins pnpm 11.2.2 via corepack and runs
  `pnpm fetch`. The install itself is left to `session-bootstrap.sh` so the
  lockfile this run is about to change stays authoritative.
- Pausing the process means disabling the routine's schedule — nothing in the
  repo needs changing, and the skill stays invocable by hand.
