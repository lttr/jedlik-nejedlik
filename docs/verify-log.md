# Verification log

Every verification step in a Claude Code session — each `vp lint --fix` after a
write, each Stop-hook lint pass, each `vp run verify:all`, each `git commit`
with its pre-commit gate — is appended as one JSON line to a scratch log
outside the repo: `${TMPDIR:-/tmp}/verify-log-jedlik-nejedlik.jsonl`.
`scripts/verify-log.sh path` prints it; `$VERIFY_LOG_FILE` overrides it. It is
session working data, not repository content, and does not survive a reboot —
copy anything worth keeping into the task's `.aiwork/` notes.

The point is to be able to ask afterwards: how often did this task actually
run, how much of it was cache hits, and which runs were redundant.

## What writes to it

| Source           | Writer                             | Covers                                       |
| ---------------- | ---------------------------------- | -------------------------------------------- |
| `agent-bash`     | `.claude/hooks/verify-log-bash.sh` | verification commands the agent runs itself  |
| `post-edit-hook` | `.claude/hooks/post-edit-fix.sh`   | the silent `vp lint --fix` after every write |
| `stop-hook`      | `.claude/hooks/stop-smart.sh`      | end-of-turn oxlint / eslint                  |
| `agent`          | `scripts/verify-log.sh event`      | milestones (task start, code review, fixes)  |

The Bash hook pairs `PreToolUse` (start stamp, keyed by `tool_use_id`) with
`PostToolUse` (log the record), so durations are real wall time.

A Bash command that **exits non-zero fires `PreToolUse` but no `PostToolUse`**
(verified 2026-08-27), so failures would otherwise be the one thing missing
from the log. The Stop hook therefore sweeps at end of turn: a start stamp
still unclaimed after two minutes belonged to a command that never reported
back, and it is logged `"unresolved"` with `exit` and `duration_ms` null,
back-dated to when it started so the timeline still orders correctly. Neither
cache data nor task detail is attached to such a record — `--last-details`
describes whatever ran most recently, not that command. `pre` sweeps a
one-hour backlog as a backstop for sessions that never reach Stop.

Unresolved covers three cases that cannot be told apart from the outside: a
non-zero exit, a command denied by another PreToolUse hook, and an interrupt.
A backgrounded command started in the two minutes before Stop is the one
false-positive case. It filters to
verification-shaped commands and never blocks or prints.

The logger excludes only its own bookkeeping — a `verify-log*.sh` in command
position, or `vp run --last-details`. A command that merely names a logger
file as an argument (`vp check --fix docs/verify-log.md`,
`git add scripts/verify-log.sh && git commit`) is logged like any other.

`git commit` is logged deliberately: the pre-commit gate (`vp staged`,
`lint:slow`, `typecheck`, `fallow`) runs inside it, so its output — and its
failures — belong in the log.

## Record shape

```json
{
  "kind": "run",
  "ts": "2026-08-27T10:36:50+02:00",
  "source": "agent-bash",
  "command": "vp run verify:all",
  "exit": 0,
  "duration_ms": 247,
  "branch": "master",
  "tree": "41cf1d3fb786",
  "session": "…",
  "cache": { "hits": 2, "total": 2, "saved_ms": 4710, "runs": 1 },
  "tasks": [
    {
      "name": "jedlik-nejedlik#nuxt:prepare",
      "command": "nuxi prepare",
      "cache": "hit",
      "reason": "output replayed",
      "saved_ms": 2250
    }
  ]
}
```

`exit` is `0` for any command that reached PostToolUse — the Bash
`tool_response` carries no exit status, so reaching PostToolUse _is_ the
success signal (a non-zero exit never gets there; the sweep catches it as
unresolved). An interrupt logs `130`, and a swept record logs `null`. Records
written by the wrapper and the two lint hooks carry the process's real exit
code. `cache` is summed from every `vp run: …` summary line in the output
(`runs` counts them), which is why a `git commit` record carries the
pre-commit gate's cache numbers even though it is not itself a `vp run`.

`tasks` comes from `vp run --last-details`, which replays the previous run's
summary from disk (~150 ms, read-only, idempotent) and is the only place
canonical task names appear — it describes exactly one `vp run`, so it is only
consulted for a command that was itself one. `tree` is a hash of HEAD + `git status` + the
working diff: two runs of one command with the same `tree` did identical work.

Milestone records are `"kind": "event"` with `event` and `message`.

## Reading it

```bash
scripts/verify-log-report.sh              # summary (default)
scripts/verify-log-report.sh timeline     # chronological, hooks and events interleaved
scripts/verify-log-report.sh tasks        # per vp task: runs, hits, misses, hit %, seconds saved
scripts/verify-log-report.sh commands     # per command: runs, failures, wall time
scripts/verify-log-report.sh redundant    # same command, unchanged tree — work that could not find anything new
```

Every view defaults to the **newest session** in the log — the file spans
every session in this project, which would otherwise make "how many times did
this run" meaningless. `--all` widens it.

Filters on any view: `--session ID`, `--all`, `--branch NAME`,
`--since 2026-08-27`, `--last N`. Views sort by execution time, so a swept
record lands where the command actually ran.

It is plain JSONL, so anything the views don't cover is a `jq` away:

```bash
jq -s 'map(select(.source == "stop-hook" and .exit != 0)) | length' "$(scripts/verify-log.sh path)"
```

## Caveats

- A "redundant" run is not automatically waste — a fully cached repeat costs
  ~250 ms. Read it together with `wasted_s`.
- The log only sees what runs through the hooks: commands run outside Claude
  Code (a plain terminal) are absent.
- The log keeps its last 20 000 lines once it passes 10 MB. One record is
  well under `PIPE_BUF`, so concurrent appends from parallel hooks stay whole.
- `session` is empty for records written outside a hook (e.g. manual
  `verify-log.sh run`), since the id arrives in the hook payload.
- Records are appended when a command _finishes_, so the timeline orders by
  completion: a slow run can appear after a fast one that started later.
- Two `vp run` commands executing concurrently (one backgrounded) share the
  one `--last-details` state, so their task lists can be misattributed. The
  `cache` rollup, parsed from each command's own output, stays correct.
