# Weekly dependency updates run on pnpm's own release-age gate, not Renovate

## Context

Dependency updates need a version oracle: something that decides what may be
upgraded this week and holds back releases young enough to still be a supply
chain attack. Renovate is the default answer to that question and brings
changelog fetching, grouping presets, merge confidence grades, rebase
machinery and `minimumReleaseAge` in one hosted package. The obvious
alternative was no oracle at all — `pnpm outdated` plus judgement.

The repo is a single-workspace Nuxt site with one maintainer, roughly forty
direct dependencies, and a `pnpm-workspace.yaml` that already carries hand-
written overrides, catalog aliases and pinned workarounds. pnpm 11 turns
`minimumReleaseAge` on by default at 24 hours, and the workspace already
uses `minimumReleaseAgeExclude`.

## Decision

No Renovate. `pnpm outdated` is the work list and pnpm's own
`minimumReleaseAge` — left at its 24-hour default — is the release-age gate.
A weekly Claude Code cloud routine reads that list, applies the bumps,
repairs the code, runs
`vp run check:all` and opens the PR from a `claude/deps-*` branch. All
judgement lives in a committed skill (`.claude/skills/dependency-update/`),
so the trigger stays swappable.

The exact pins, the `catalog:` aliases and the documented `DELETE-WHEN`
workarounds in `pnpm-workspace.yaml` are out of the automation's scope: it
reports on them and never edits them.

## Why

The one thing Renovate was really buying here — holding back fresh releases
— is now a package-manager default, and honouring it costs nothing because
pnpm enforces it on every install regardless of who triggers it. What
remains of Renovate's value is grouping and changelog reading, which the
agent does anyway as part of assessing risk, so paying for a second bot to
own a branch would mostly buy an ownership conflict: pushing a repair commit
onto a Renovate branch makes Renovate stop managing it.

The cost accepted: no merge confidence grades, no automatic rebasing of a
stale PR, and no dependency dashboard. The mitigation is procedural — only
one dependency PR may be open at a time, and a run that finds one open skips
that week rather than opening a second or rebasing someone else's branch.

Reversing this is not free but not dramatic either: Renovate could be added
later in dashboard-only mode as the version oracle, with the skill reading
the dashboard issue instead of `pnpm outdated`. That path was left open on
purpose.
