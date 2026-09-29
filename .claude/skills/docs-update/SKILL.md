---
name: docs-update
description: Fix docs that are false against the code and open one PR.
disable-model-invocation: true
argument-hint: "[since, default 8 days ago]"
---

# Docs update

Run `/maintenance:docs-checker` over `README.md`, `GLOSSARY.md` and `docs/`,
then fix what it finds instead of only reporting. Start from what changed on
`master` since `$ARGUMENTS` (default: 8 days ago), but older mistakes count too.

## The bar

Change a doc only if a reader following it as written would do the wrong thing
or get stuck. Cite the code that proves it.

Never add indexes, overviews, feature announcements, change history or
anything another file already says. Prefer deleting a stale passage to
correcting it.

## Output

If nothing passes the bar, stop without a PR. Otherwise one `docs:` commit and
a PR listing each change with its evidence.
