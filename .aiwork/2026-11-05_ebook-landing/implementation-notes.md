# Implementation notes — e-book landing

- **All copy and claims live in `web/app/components/ebook-cukrovi/content.ts`.**
  Each claim on the „confirm with Zdeňka" list is marked `// CLAIM:` there,
  so corrections after her review are one-line edits. The author photo is the
  one `/kontakt` uses (`AUTHOR_PHOTO_ID`); swap the id when the final photo
  arrives.
- **`InitiateCheckout` is new, not kept.** Last year's page sent no pixel
  events (the meta-pixel spec excluded the e-book on purpose). The spec asked
  for it, so the buy buttons now send it with content name `ebook-cukrovi`.
  There is no `Purchase` for the e-book yet (area 03), so Meta shows checkouts
  without sales until that ships. `docs/analytics.md` says so.
- **Buy buttons open SimpleShop in the same tab** (last year opened a new tab),
  matching `LiveCourseBuyLink`.
- **Merged copy, judgment calls:** the „vyřízená máma" FAQ keeps last year's
  caveat (rest first if you're overloaded) after the prototype's quick-start
  tip. „Co v e-booku nenajdete" folded into the recipes FAQ answer. Last
  year's theory chapters became one line under the eight tools. „Co vám
  přinese" became the lead under „Co se u vás změní". The bio adds last year's
  „bez strašení a bez nerealistických slibů". The pricing box has no sales
  deadline: last year's „Ke koupi do 21. 12." has no 2026 date yet.
- **Media strip is plain text, no links** (spec: links later, area 00).
- **Book cover is drawn in CSS** with the site's cookie illustration. Last
  year's page had no cover image to reuse.
- **The nav button from area 02 shipped with this page** (review feedback):
  „Cukroví s dětmi" in `MainNav.vue`, on every page, hardcoded. Remove or
  swap it after Christmas until area 08 drives it from Directus. The top bar
  from area 02 is still not built. The brick red moved to `main.css` as
  `--color-brick-red` because the nav uses it too.
- **Desatero is a newsletter sign-up** (user's call, overriding the spec's
  „section 14 not rendered"): the „Ještě váháte?" box links to
  `/cukrovickove-desatero`, whose form leads to the thank-you page with
  last year's desatero PDF (Directus `d5f38263…`). Swap the file id if
  Zdeňka updates it for 2026.
