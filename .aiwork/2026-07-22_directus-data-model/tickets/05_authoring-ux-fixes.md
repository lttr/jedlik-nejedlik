---
status: ready
blocked_by: [04]
references:
  - "Spec: ../spec.md"
  - "Findings: ../implementation-notes.md (2026-08-19, FP-11 authoring findings)"
---

# 05 — Authoring UX fixes from the FP-11 walkthrough

**What to build:** the four admin-app friction points the author hit while
building the dummy course, fixed on the instance and captured in the
committed config-as-code dump. All four are authoring ergonomics — no
collection, field-type or permission change, so the area's probe matrix
must stay green untouched.

## Findings to fix

1. **List views show `Popis`/`Obsah` instead of leading with the name.**
   The default layout for `course`, `section` and `lesson` surfaces the
   rich-text description column, which is noise in a table. First column
   should be the title. `directus/config/collections/presets.json` is
   currently `[]` — no global preset exists, so every user gets Directus'
   own default. Fix with collection-level presets (`user: null`,
   `role: null`) that directus-sync then dumps.
2. **`entitlement.granted_at` is required but has no default.** The author
   must type the timestamp by hand when granting access manually. Give it
   a `$NOW` default for the author/admin path. Careful: ticket 03's review
   deliberately made the *student* create-permission preset `granted_at`
   server-side and drop it from the writable field list — that hardening
   must not regress. The probe asserting the 403 on a student-supplied
   `granted_at` has to stay green.
3. **`lesson.video_uid` stays visible on a text lesson.** Nothing hides it
   when `type != video`, so a text lesson can carry a stray Cloudflare
   Stream UID (it did, in the dummy course). Add a `hidden` condition
   modelled on `section.unlock_delay_days`, which already does exactly
   this for `unlock_rule != time_since_purchase`.
4. **Drag-ordering sections assigns `sort` to only some rows.** After the
   author reordered by dragging, sections 3 and 4 had `sort` 1 and 2 while
   sections 1 and 2 were left `null` — list order is then undefined.
   Reproduce, determine whether this is a `sort_field` configuration gap
   or upstream Directus 11.13.1 behaviour, and either fix the config or
   backfill `sort` and document the workaround. Applies to `lesson` too
   (same o2m drag pattern).

## Acceptance criteria

- [ ] Collection presets for `course`, `section`, `lesson` lead with the
      title and drop the rich-text column; committed in `presets.json`
- [ ] Manual entitlement grant prefills `Čas přidělení`; student-side
      `granted_at` hardening from ticket 03 verified unchanged
- [ ] `Video UID (Cloudflare Stream)` hidden on text lessons; existing
      stray value on lesson 7 cleared
- [ ] Section/lesson drag-ordering produces a complete `sort` sequence, or
      the limitation is documented with a workaround for the author
- [ ] Full probe suite still green (14 public + 29 student + 18 author)
- [ ] directus-sync `pull` re-run, dump diff-clean, changes committed
- [ ] Merged to master, Coolify deploy green

## Out of scope

- The dummy course's unfilled fields (price, test threshold, cover) and its
  `draft` status — deliberately left as-is, see ticket 04's closing note.
- Real Cloudflare Stream UIDs — area 08.
