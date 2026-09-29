---
name: docs-update
description: Fix docs that are false against the code and open one PR.
disable-model-invocation: true
argument-hint: "[since, default 8 days ago]"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Docs update (this repo)

The audit procedure lives in **`/maintenance:docs-checker`**: the deterministic
link and path pass, then the evidence-bound semantic pass. Run both, over
`README.md`, `GLOSSARY.md` and `docs/` (it adds every `CLAUDE.md` and
`.claude/` on its own). Where it says "report only, do not edit", this skill is
the user's go-ahead: fix what passes the bar below.

For the semantic pass, start from what changed on `master`. `$ARGUMENTS` sets
the window: a date gives `git log --since=<date> --stat`, a ref gives `git log
<ref>..master --stat`, and empty means `--since='8 days ago'`. The window only
picks where to look first; a false statement older than it is still in scope. Read the code a doc points at before calling
it stale.

## The bar: would a reader act wrongly?

Every edit must answer yes to one question: **would someone who follows the doc
as written do the wrong thing, or get stuck?** The doc is judged by what it
makes a reader do, not by how complete it looks.

Passes the bar:

- A statement the code contradicts (a policy list missing a policy, "holds no
  token" when it holds one). Cite the file:line that proves it.
- A command, script, path or env var that does not exist, or one that is
  required and missing — e.g. the app refuses to boot without a variable the
  setup section never mentions.
- Two context files giving contradicting instructions.

Does not pass, however true it is:

- Indexes, tables of contents, "see also" lists and layout overviews. Readers
  find files in the tree; an index is one more thing to go stale.
- Restating what another file owns. `CLAUDE.md` owns the layer stack, import
  rules and agent workflow; the README links to it, it does not summarise it.
- Announcing features. The README does not need to list what shipped.
- Change history in prose ("since 2026-09-23", "no longer the exception").
  Docs describe the current state; history is in git.
- Wording, tone and level-of-detail changes.

When a stale passage no longer has a reader, delete it rather than correct it.
A smaller doc that is right beats a larger one that is complete.

## Output

- Nothing passed the bar: no branch, no PR. Say so and stop.
- Otherwise one commit, `docs: ...` (Conventional Commits, scope is a code area
  if one fits), through the normal pre-commit hook. `check:all` must pass.
- PR body: one bullet per change with its evidence (doc file:line → code
  file:line). Below it, at most five lines of **Seen, not changed** — things
  that fail the bar but the user may want to know about. Never pad this list.

The weekly cloud routine that triggers this skill is "Check docs" on
claude.ai, prompt: "Run the `/docs-update` skill."
