---
status: done
blocked_by: [04]
references:
  - "Spec: ../spec.md"
  - "Findings: ../implementation-notes.md (2026-08-19, FP-11 authoring findings)"
  - "Outcome: ../implementation-notes.md (2026-08-19, Ticket 05)"
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

- [x] Collection presets for `course`, `section`, `lesson` lead with the
      title and drop the rich-text column; committed in `presets.json`.
      Also required deleting the author's *user-scoped* presets, which
      shadow global ones — that, not an empty `presets.json`, was the cause
- [x] Manual entitlement grant no longer needs a hand-typed timestamp:
      `granted_at` gets `CURRENT_TIMESTAMP` as its DB default and is no
      longer `required`; admin-omitted, author-omitted and explicit
      (backdated) writes all verified. Student-side `granted_at` hardening
      from ticket 03 is on `order_consent` and untouched — probe green
- [x] No text lesson carries a stray `Video UID`. The `hidden` condition the
      ticket asked for already existed since `cdf4163`; the residual problem
      is that hiding a field does not clear it, so the fix is data-side
      (lesson 7 → `video`, lesson 8 → `text` with `video_uid` nulled)
- [x] Section drag-ordering documented: `sort_field` is correctly configured
      on all three collections, so this is upstream Directus behaviour, not
      a config gap. Course 6's sections backfilled to `1..4`; workaround for
      the author recorded in the implementation notes
- [x] Full probe suite green — 61/61, twice consecutively. One probe was
      corrected (out-of-folder author upload answers 204, not 200) and
      `probeUpload` now tolerates an empty body
- [x] directus-sync `pull` re-run and committed. It also surfaced
      **pre-existing drift** this ticket did not cause: four Autor policy
      file/folder rules (instance stricter than the dump), committed
      separately by the repo owner as `92cef00`, and two `settings.json`
      fields, which ride along here
- [ ] Merged to master, Coolify deploy green

## Unplanned work folded in

- **Entitlement id 6 revoked.** The FP-11 leftover entitled the probes'
  "unentitled" student to course 6 and broke two student probes. Revoking it
  via the author token also closed the manual-revocation step ticket 04 left
  unverified.
- Four orphaned `test-autor-probe-stray.txt` files deleted from the
  instance — leaked by the probe bug above across earlier runs.

## Out of scope

- The dummy course's unfilled fields (price, test threshold, cover) and its
  `draft` status — deliberately left as-is, see ticket 04's closing note.
- Real Cloudflare Stream UIDs — area 08.

## Deliberately not done

- The repo owner's own user-scoped `course` preset (id 21) still leads with
  `description`. It is personal account state, not shared config.
- The Autor policy's folder rules match the folder by **name**
  (`"Materiály kurzů"`) rather than by UUID, which is the more fragile of
  the two. Flagged in the implementation notes; changing it is a
  permissions change and this ticket is scoped to authoring ergonomics.
