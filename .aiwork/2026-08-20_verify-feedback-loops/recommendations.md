---
references:
  - vite.config.ts
  - .claude/skills/implement-spec-to-pr/SKILL.md
  - .claude/hooks/stop-smart.sh
  - .claude/settings.json
  - scripts/smoke-dev.sh
---

# Verify feedback loops — recommendations

Source: retrospective of a Claude Code web session that implemented the auth
tickets. The session over-ran cheap checks roughly 3× (lint, typecheck,
builds), never ran the expensive ones (unit tests, probes, browser), and left
every behavioural finding as a one-off curl in the transcript.

The two failure classes have different causes, so they get different fixes:

1. **Redundant runs** are a cache-design problem, not an agent-discipline
   problem. Fix the cache so a repeated run is free, then stop legislating
   when to run checks.
2. **Skipped verification** is a prose-vs-gate problem. The session obeyed
   every hook-enforced check and skipped every prose instruction ("Visual
   check in the browser"). Move the skipped checks behind gates with exit
   codes.

## 1. Fix the cache so repeated `verify:all` is free

**Highest-leverage change in this doc.** `srcInput` in `vite.config.ts` uses
`{ auto: true }`, which sweeps in `.aiwork/**` and all markdown. The
implement workflow tells the agent to append to `implementation-notes.md`
continuously, so the cache is invalidated by design on nearly every verify
run — hence "2/8 cache hit" with no `web/` change, and ~3 wasted Nuxt builds
per session.

```ts
const srcInput = [
  { auto: true },
  "!**/.aiwork/**",
  "!**/*.md",
  // …existing artifact excludes
]
```

Two companions:

- **`verify:smoke` has no `input` at all**, so it boots a dev server on every
  `verify:all` even when nothing changed. Give it `input: srcInput` so it
  caches like the rest.
- **`smoke-dev.sh` must clean up dev locks in its trap.** A stale lock from a
  smoke run blocked the next dev server for the rest of the session.

## 2. Make `verify:all` the only verification entry point

Once the cache is correct, a repeated `verify:all` re-runs only the steps
whose inputs changed. The cache performs the dedup the agent failed to do by
hand, so the policy collapses to one sentence for CLAUDE.md:

> Never run `verify:check` / `verify:lint` / `verify:typecheck` /
> `verify:build` (or their underlying tools) standalone. `vp run verify:all`
> is the only verification command — caching makes repeats free.

This replaces the fragile "standalone checks during the loop, `verify:all`
once at wrap-up" discipline, which the session demonstrably could not hold.

Supporting note: lint pre-running is already quadruple-covered. The
PostToolUse hook autofixes on every write, `stop-smart.sh` runs oxlint and
eslint on all changed files at the end of every turn, the pre-commit hook
runs `vp check --fix` on staged files, and `verify:all` runs both linters
again. By commit time a lint failure should be rare; the existing CLAUDE.md
"don't pre-run a linter" line is safe to obey.

## 3. Behavioural rules the tooling cannot absorb

- **Never pipe a check through `head` / `tail` / `grep`.** Run it bare — the
  harness reports the exit code. Piping swallowed two exit codes and forced
  two full suite re-runs to recover one integer each.
- **Never `git add -A`; stage explicit paths.** The unrelated-files commit
  required both a repo-wide `vp check --fix` and `-A` to happen. Optionally
  hard-enforce with permission denies in `.claude/settings.json`
  (`Bash(git add -A*)`, `Bash(git add .*)`), same pattern as the existing
  `--no-verify` denies.
- **Kill dev servers by port, not by pattern.** `pkill -f "nuxi dev"` matched
  the agent's own shell command line and killed it. Use the stored PID or
  `fuser -k <port>/tcp`.
- **If you curl an endpoint twice to prove behaviour, promote the proof to a
  probe or unit test before the ticket closes.** The rate-limit ordering bug
  — the session's best find — currently lives only in the transcript and is
  the first candidate.

## 4. Unit tests: run after every block of work, no per-commit mandate

Decision: not all production code needs tests all the time, but tests must
run in general after every block of work.

That maps to structure, not a gate on writing tests:

1. Create a unit-test setup — `web/tests/unit/`, a vitest config alongside
   the existing `vitest.probes.config.ts`, and a `verify:test` task.
2. Add `verify:test` to `verify:all`'s `dependsOn`. Combined with §2, tests
   then run automatically after every block of work, forever, at cache-hit
   cost when nothing changed.
3. **No hook blocks a commit for lacking a test file.** Whether a change
   deserves a test stays a judgment call, recorded in the evidence table
   (§7) when the answer is "no test".

## 5. Probes: a conditional gate on permission-touching changes

Probes stay out of `verify:all` (they hit production and need tokens — the
config comment is right). The forcing shape is conditional:

- If the branch touches `directus/config/**` or auth-related server code, a
  fresh `vp run directus:probe` is required before commit.
- Mechanism: the probe task writes a timestamp marker file (gitignored). The
  pre-commit or Stop hook blocks when those paths changed and no marker is
  newer than the newest staged file.

This directly fixes "wrote 250 lines of probes, extracted nothing": the
probes existed, nothing compelled executing them.

## 6. Browser verification: executable step, screenshots kept out of git

Rewrite `implement-spec-to-pr` Step 5 from "Visual check in the browser"
(unverifiable, therefore skippable) into a procedure:

1. Use the `run-jedlik-nejedlik` skill with `agent-browser`.
2. Screenshot every changed route into
   `.aiwork/{task}/screenshots/` .
3. List the screenshot paths in implementation-notes and the final report.

Decision: screenshots are working evidence, not repository content. Add to
`.gitignore`:

```
.aiwork/**/screenshots/
```

The files stay on disk for the session, so a local gate (Stop hook or
pre-push) can still check "did `web/app/**` change with no screenshot newer
than the branch point?" — enforcement does not require committing them.

## 7. One unifying enforcement point: the evidence table

Instead of three scattered checks, the spec template gains a mandatory
"Verification evidence" table the skill must fill before shipping:

| Evidence    | Value                                     |
| ----------- | ----------------------------------------- |
| Tests       | path, or "n/a: why"                       |
| Probe run   | timestamp, or "n/a: no permission change" |
| Screenshots | paths, or "n/a: no UI change"             |

A single hook script greps for empty cells and exits 2 (Stop hook → the
agent self-heals in-session). "n/a" claims stay visible for human review in
the PR. This is the soft-force layer that matches the §4 decision: it forces
an explicit answer, not a particular one.

## Priority order

1. §1 cache fix (two-line config change, biggest payoff) + smoke `input` and
   lock cleanup.
2. §4 `verify:test` scaffold, wired into `verify:all`.
3. §6 Step 5 rewrite + `.gitignore` entry.
4. §7 evidence table in the spec template, then the hook that checks it.
5. §5 probe marker gate.
6. §3 rules into CLAUDE.md; optional `git add` permission denies.
