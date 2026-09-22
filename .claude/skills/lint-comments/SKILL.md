---
name: lint-comments
description: Grade the code comments in a part of the codebase with lint-comments and fix the findings. Use when asked to clean up, review, or improve comments in a file, directory, or the current branch.
argument-hint: [path-or-directory | --diff master]
---

`lint-comments` extracts every comment and has a model judge whether it earns
its place. Findings are advisory: read each one against the code and decide.

## Run

```sh
lint-comments <path> --format text          # a file or directory under web/
lint-comments --diff master --format text   # only comments added on this branch
lint-comments <path> --no-model --format text  # free pass: deterministic rules only
```

Default target when `$ARGUMENTS` is empty: `--diff master` on a feature
branch, otherwise ask which directory. A directory run also reports
`duplicate` (same text in more than one place). Prefer directories over the
whole `web/` tree so the review stays reviewable.

## Act on findings

One block per comment: location, first line, then rules with evidence. The
percentage is the grader's confidence in the claim before it.

- `remove` — the comment restates the code, narrates history, or answers a
  question no reader would ask. Delete it. If the code is unclear without it,
  make the code clearer (rename, extract) instead of keeping the comment.
- `rewrite` — unclear or leans on a codename or context it does not define.
  Rewrite so a reader new to the file gets it on first reading; say the why,
  not the what.
- `shorten` — over 40 words. Cut to the reason; move detail to a doc or a spec.
- `dead-code` — commented-out code. Delete it; git has it.
- `duplicate` — same text in several places. Keep one, near the shared cause,
  or delete all.
- `redundant-jsdoc` — bare `@param`/`@returns` with no content. Delete the block.
- `todo-without-ref` — add a ticket or link, resolve it, or delete it.

Disagree with a finding? Leave the comment as it is and say so in the
report. Never add `lint-comments: keep` markers: they would pile up as an
escape hatch, and a repeated false positive costs one line of output.

Do not touch comments the run did not flag, and do not touch code beyond what
a comment fix needs (a rename that replaces a comment is fine).

Czech copy inside comments follows `writing:czech-typography` like any text.

## Finish

Re-run the same command; stop when the run is clean or only findings you
disagree with remain, and list those in the report. Then `vp run check:all` (formatting may have shifted).
Commit as `style(<area>): ...` or fold into the branch's commit when the
cleanup is part of it.
