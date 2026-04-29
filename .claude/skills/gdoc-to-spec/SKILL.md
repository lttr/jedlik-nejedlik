---
name: gdoc-to-spec
description: Download a Google Doc as markdown and turn it into an .aiwork spec ready for the `implement` skill. Detects inline editor notes (e.g. "Přeformulovala bych", "KLIKACÍ TLAČÍTKO", "@@", strike-through remarks) and converts them into `<!-- TODO: ... -->` markdown comments so the implementer sees them as actionable items. Trigger when the user pastes a docs.google.com URL and wants to import it as a spec, or says "stáhni gdoc", "import gdoc", "gdoc as spec", "gdoc → spec".
allowed-tools: Bash, Read, Write, Edit, Skill
argument-hint: <google-doc-url> [slug]
---

## Context

- Today: !`date +%Y-%m-%d`
- Auth: !`gws auth status 2>&1 | rg -A 8 '"scopes"' | head -10`

## Step 1 — Extract doc ID

Parse `$ARGUMENTS`. The first arg is a URL like `https://docs.google.com/document/d/{ID}/edit?...`. Extract `{ID}` (the segment after `/d/`).

If a second arg is given, use it as the slug (kebab-case, max 40 chars). Otherwise derive a slug after step 2 from the doc title.

## Step 2 — Verify auth

If scopes don't include `drive.readonly` (or `drive`) and `documents.readonly` (or `documents`), tell the user to run:

```
gws auth login --readonly -s drive,docs
```

Stop and wait. Don't try to invoke the browser flow yourself — it blocks on user interaction.

## Step 3 — Export as markdown

Run from the **current working directory** (gws refuses paths outside cwd):

```
gws drive files export \
  --params '{"fileId":"<ID>","mimeType":"text/markdown"}' \
  --output gdoc-raw.md
```

Also fetch the title for slug derivation:

```
gws drive files get --params '{"fileId":"<ID>","fields":"name"}'
```

Slugify the name (lowercase, ASCII-fold Czech diacritics, kebab-case, max 40 chars) if no slug was provided.

## Step 4 — Detect editor notes

Read `gdoc-raw.md`. Editor notes are review remarks left inline by the author or a reviewer that should NOT appear in published copy. Heuristics — flag a phrase if it matches one or more:

- **Czech first-person reviewer voice** mid-sentence: "Přeformulovala bych", "držela bych", "napsala bych", "změnila bych", "navrhuji", "možná spíš".
- **Meta-questions** about the text itself: "Jak je to myšleno?", "Co tím myslíš?", "Není to moc obecné?" — but ONLY when they appear inside body prose, not as section headings (the doc may legitimately use rhetorical questions as headings).
- **ALL-CAPS placeholders** in otherwise mixed-case text: `KLIKACÍ TLAČÍTKO`, `CTA`, `OBRÁZEK SEM`, `TODO`, `XXX`, `TBD`.
- **Bracketed instructions**: `[doplnit]`, `[link]`, `[TBD]`, `{{...}}`, `<<...>>`.
- **Doubled punctuation glue** between two sentences with no space — often a reviewer's note jammed against the prior word (e.g. `autoritu Jak je to myšleno?Přeformulovala bych`).
- **Unfinished fragments** ending mid-thought: trailing `…` followed by a verb in conditional ("bych", "by se", "by mělo").

Be conservative. If a phrase could plausibly be valid Czech body text (e.g. lone "jen" before a capitalized word), leave it and mention it in the report — don't force a TODO.

## Step 5 — Rewrite into spec

Write `.aiwork/{date}_{slug}/spec.md` with this shape:

```markdown
---
source: <google-doc-url>
imported: <YYYY-MM-DD>
---

# <doc title>

> Imported from Google Doc. Editor notes converted to `<!-- TODO: ... -->` comments — resolve before publishing.

<doc body, with editor notes replaced>
```

Replacement rule for each detected note:

- Remove the note from the visible text.
- Insert an HTML comment `<!-- TODO: <category> — "<original note verbatim>" — <one-line action in Czech> -->` at the same position.
- Categories: `editor-note`, `placeholder`, `cta`, `unfinished`.

Keep all other content byte-identical to the export — do not rewrite prose, fix typos, or change headings. The implementer's job is to act on the TODOs.

Then delete `gdoc-raw.md`.

## Step 6 — Hand off

Print:

- Path to the created spec.
- Count of TODOs inserted, grouped by category.
- Any phrases you considered but did not flag (so the user can override).
- The exact next command:

  ```
  /implement .aiwork/{date}_{slug}/spec.md
  ```

Don't invoke `implement` yourself — the user runs it when ready.

## Notes

- gws output paths must be inside cwd. Always `cd` to the repo root (or a subdir of it) before exporting.
- If the doc contains tables, gws emits standard GFM pipe tables — leave them.
- If the doc contains comments (Google Docs review comments, not inline notes), the markdown export drops them. There is no API field to recover them via `files.export`. Mention this limitation in the hand-off if the doc looks like it had review activity.
