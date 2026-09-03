---
name: dependency-update
description: Weekly dependency update run. Reads what pnpm says is outdated, upgrades what is safe, applies the code changes the new versions need, verifies, and opens one reviewable PR. Supports a read-only dry run that reports what it would do. Use when the user says "dependency update", "/dependency-update", "update deps", "dry run the dep update", or when the weekly cloud routine fires.
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch
---

# Dependency update

One run produces at most one pull request. Apart from the scan script
(`scripts/dep-scan.mjs`), every step here is a judgement call, not a mechanical
procedure.

Merging the PR deploys to production, and nothing is automerged. The goal is
therefore a PR a tired human can review honestly in a few minutes, not the
largest batch that passes CI.

**Dry run** (`/dependency-update dry-run`, or any "dry run" / "just report"
phrasing): do §0–§3 strictly read-only — no branch, no install or update, no
edit, commit, push, PR, or weekly note — then print a report and stop. The
report covers what you would bump and would not, and why (including the
breaking-change evidence for majors), the exact commands §4 would run, the
DELETE-WHEN status, and what even a real run could not verify; state up front
that nothing was verified. Still read the release notes — the value of a dry
run is the reasoning about each update, not the list of versions. Stop
conditions from §0 don't stop a dry run; name them in the report and carry on
scanning. Do not proceed to §4 unless the user asks in a new message.

## 0. Preflight: stop conditions

Run these first. If any stop condition holds, do the stated thing and end the
run; do not "work around" it.

```bash
git fetch origin --quiet
gh pr list --state open --json number,title,headRefName \
  --jq '[.[] | select(.headRefName | startswith("claude/deps-"))]'
```

- **A dependency PR is already open** → do not rebase, supersede or close it.
  Write the weekly note (§7) saying which PR is open, say so in the final
  message, stop. What happens to that PR is the maintainer's call.
- **Working tree dirty, or HEAD is not an ancestor of `origin/master`** → stop
  and say so. This run only ever starts from a clean, current `master`.

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

The JSON output holds one row per outdated direct dependency per workspace, with
`declared` (the range in `package.json`), `bump` (`patch`/`minor`/`major`,
0.x-aware), `inScope`, `outOfScopeReason` and `repo`.

- `inScope: false` rows are **report only**: exact pins, `catalog:` aliases,
  `npm:` aliases and packages covered by a `pnpm-workspace.yaml` override. Never
  bump them. They go in the PR body's "Reported, not touched" section.
  - The `rolldown` pin in `web/` is the canonical example: `nuxt` peers
    `rolldown: ~1.2.1` without marking it optional (`@nuxt/vite-builder` peers
    `^1.0.0` too), so it stays with or without the vite-plus alias. The pin is
    exact and tracks whatever the catalog's `vite-plus` release bundles
    (0.3.0 → 1.2.5) — never widen it to a range; rolldown ships a native binary
    and a skew against vite-plus's own copy breaks `vp` outright. Move it only
    in lock-step with a `vite-plus` bump.
- `deleteWhen` lists the documented workarounds. Evaluate each condition against
  what you learned reading release notes and report it as satisfied or not.
  **Never remove a workaround**, even when its condition is satisfied.
- `hoistSkew.skewed` lists packages installed at two majors that Nuxt also maps
  in its generated tsconfig `paths`. Report every row in the PR body; act only
  when one bites (§6). `checked: false` means `web/.nuxt` was missing — run
  `vp install` and scan again rather than reporting "none".
- `counts.inScope == 0` → nothing to do. Write the weekly note (§7), say so,
  stop.

## 2. Read release notes, but only where it pays off

Fetch notes per package, only when needed. Read notes for: **every major**,
every package in the Nuxt group, and minors of consequential packages (anything
that touches build, lint, types, runtime rendering or the Directus SDK). Patch
bumps and icon data (`@iconify-json/*`) need no reading.

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
  version number. Rows with `repo: null` have no GitHub source: use
  `https://www.npmjs.com/package/<name>?activeTab=versions`.

## 3. Decide the shape of the run

**What matters is the impact on this codebase, not the semver digit.**

- A **major whose breaking changes provably do not touch this codebase** goes
  into the batch. "Provably" means: you read the breaking-change list, and for
  each item you searched our source and found nothing. Record the evidence
  (the item, the search, the result); it goes in the PR body.
- A **major that demands real code changes** gets its own PR, at most one per
  run. Further such majors are listed as queued in the batch PR and left alone.
- The **Nuxt group is indivisible**: `nuxt`, `@nuxt/*`, `@nuxtjs/*`, `vue`,
  `vue-router`, `nitropack` and the vite/vitest catalog entries move together or
  not at all. Never ship half of it.
- When a package ships a **codemod or migration CLI**, find it in the release
  notes and run it instead of re-deriving the changes by hand.

When an update could go either way, prefer the batch PR: only one PR ships per
week, and a migration PR uses up that slot.

## 4. Branch and apply

```bash
git switch -c claude/deps-$WEEK    # migration run: claude/deps-$WEEK-<package>
pnpm update --latest <pkg> <pkg> ...        # root workspace packages
pnpm --filter web update --latest <pkg> ... # web workspace packages
pnpm dedupe                                  # when the lockfile gained duplicates
```

Always name the packages explicitly: a bare `pnpm update --latest` would also
bump the out-of-scope rows.

**Commit 1 (bumps only)**: `package.json`(s), `pnpm-lock.yaml`, and the weekly
note from §7 — nothing else. Subject `deps: batch update $WEEK`; body lists each
bump (`name current → latest`) and quotes the exact `pnpm update` commands run.

## 5. Repair the code

Only now touch source. Codemod output and hand repairs both land here, and they
become **commit 2** (`deps: adapt code to <package> <version>`, one bullet per
API), the only commit the maintainer has to read. Skip commit 2 entirely when
no code changes were needed.

**Nuxt auto-imports have no import statement.** "Find all usages" means
`rg '\bmyComposable\b' web/app web/server` or LSP references. Never an import
graph, and never the conclusion "no import found, so it is unused". That
conclusion feels certain and is wrong; assume the symbol is used until ripgrep
says otherwise.

## 6. Verify, and the repair loop

```bash
vp run check:all
```

This is the gate (run it bare, per CLAUDE.md).

On failure in a **batch** run:

1. Identify the offending package (the failure text usually names it; otherwise
   bisect by dropping the most suspicious bump).
2. Drop it (revert its `package.json` entry and re-run the install so the
   lockfile matches) and re-verify.
3. Bounds: **at most 2 drops and 3 verify cycles per problem.** Hitting either
   bound means stop and hand over: open the PR with the failure quoted at the
   top of the body. Do not keep trying.

A **migration** run has nothing to bisect: on failure, hand over directly with
the failure at the top.

### Type errors naming two copies of one package

A failure like "Type `X` from `.pnpm/pkg@1.…` is missing the following
properties from `X` from `.pnpm/pkg@2.…`" is not a bad bump to bisect. The repo
sets `shamefullyHoist`, so exactly one copy of a duplicated package reaches the
root `node_modules`, and Nuxt's generated tsconfig `paths` map bare imports at
whichever landed there. Which copy wins is decided during install, not by the
lockfile — so a regen can flip it with nothing in the diff to explain why.

Read `hoistSkew` from the scan before bisecting anything, and check the chain
that owns the package (`nuxt` → `@nuxt/nitro-server` → `nitropack` → its `h3`
range) to learn which major is correct. That answers it outright; don't
reconstruct old installs to prove when it broke, because the framework's
declared range decides it either way.

The fix is to declare the package in `web/package.json` at the major the
framework resolves, so that copy lands in `web/node_modules` and the paths
follow it. Pin it **exactly**: the declaration exists to name the same copy the
framework uses, so a range that can drift off it defeats the purpose. Document
it as an `# ISSUE:` / `# DELETE-WHEN:` comment in `pnpm-workspace.yaml` — that
is where §1 scrapes conditions from, and the exact pin makes the row
`inScope: false` so a later run cannot bump it to the wrong major. `h3` on
2026-09-03 is the worked example. `ofetch` is the next candidate: also
installed at two majors, and currently correct only by luck of the hoist.

When a hand-resolved `pnpm-lock.yaml` conflict is what preceded the failure,
re-run a full `vp install` before believing any of it. A lockfile-only install
leaves `node_modules` and `web/.nuxt/tsconfig.*.json` describing the old tree,
and the resulting errors point at packages that are already fine.

Report every dropped package as deferred in the PR body: a problem package
must be visible, never silently skipped.

If commit 1 already exists when a drop happens, rewrite it to include the
revert only while it is unpushed. Once pushed, let the drop be its own commit
and say so in the body.

**Forbidden, without exception:**

- Never edit, skip, or weaken a test to make verification pass.
- Never widen a version range to dodge a peer conflict.
- Never touch files unrelated to the upgrade.
- Never hand-edit `minimumReleaseAgeExclude` (only `pnpm audit --fix` writes it).
- Never remove or edit a `pnpm-workspace.yaml` workaround, override, catalog
  entry or pin.
- Never `git push --force` this branch or amend a pushed commit.

## 7. Weekly note

`.aiwork/{TODAY}_dep-update/notes.md`, committed as part of commit 1 (or on its
own when the run stops early). Keep it short: what the scan found, what was
bumped, what was deferred and why, DELETE-WHEN status, and the outcome. A run
that did nothing still writes this file, so that next week it is clear the run
happened and found nothing, rather than not happening at all.

## 8. Open the PR

```bash
git push -u origin claude/deps-$WEEK
gh pr create --label deps --title "deps: safe batch $WEEK" --body-file <file>
```

Title: `deps: safe batch {week}` or, for a migration, `deps: {package} {from}→{to}`.
Body in English, first line the verification result (✅ green, or ❌ HANDED
OVER with the failure quoted). Then these sections:

- **Bumps** — table: package, from, to, notes.
- **Majors in this batch** — per major: the breaking-change items, the search
  run for each, and the result.
- **Code changes** — one line per change, or "none — commit 2 absent".
- **Deferred** — dropped packages with the failure, and majors queued for a
  later run.
- **Reported, not touched** — pins, catalog aliases, override workarounds, with
  the newer version available.
- **Hoist skew** — each `hoistSkew.skewed` row: the package, the majors
  installed, and which one Nuxt's tsconfig `paths` currently point at. A row
  where those disagree with the framework's own range is a latent typecheck
  break, whether or not this run tripped it.
- **DELETE-WHEN status** — each condition: satisfied / not satisfied, and why.
- **Not verified** — what this run could NOT check (e.g. runtime behaviour of
  the Directus SDK against the live CMS, visual rendering).

The **Not verified** list is mandatory and must be honest. A PR that claims
everything is fine is a failure of this skill, not a good week. If the list is
hard to write, the batch was probably too large.

Finish by telling the user the PR URL and the one thing worth their attention.

The weekly cloud routine that triggers this skill is documented in
`docs/dependency-update-cloud-routine.md`.
