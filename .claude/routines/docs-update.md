---
name: docs-update
description: Fix docs that are false against the code and open one PR.
---

# Docs update

Run `/maintenance:docs-checker` and fix what it finds; this run is the user's
go-ahead to edit. Look hardest at what changed on `master` in the last 8 days
(a weekly routine plus a day of slack).

Fix a finding only if a reader following the doc would do the wrong thing or
get stuck. Prefer deleting a stale passage to correcting it, and never add new
content. Leave "unverified" findings alone.

If nothing qualifies, stop. Otherwise make one `docs:` commit and open a PR
listing each change with its evidence.
