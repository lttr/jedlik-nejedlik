---
status: blocked
blocked_by: "ticket 05: Directus file-read permission for the Student and Autor policies (implementation-notes.md)"
references:
  - "Epic: ../2026-06-09_kurzy-platforma/areas.md"
  - "ADR 0004: ../../docs/adr/0004-course-pages-read-through-nitro.md"
  - "ADR 0002: ../../docs/adr/0002-nitro-mediated-auth-sessions.md"
---

# Spec — Area 03: Catalog + Sales Pages

Decisions were settled by grilling on 2026-09-14. Architecture for the
read path is recorded in ADR 0004.

## Problem Statement

Nothing on the site sells an On-demand Course. The Courses that exist
today are Live Courses on hand-written marketing pages that send the
buyer to SimpleShop, which R-4 retires. Area 01 created the `course`,
`section` and `lesson` collections and opened them to the public role,
and area 02 shipped login, so the platform can hold a priced Course and
identify a buyer. It cannot show either to anyone.

An Author also has no way to see what a Course will look like as a page.
They fill fields in Directus and then guess.

## Solution

Two public pages in the `shop` layer. The Catalog at `/kurzy` lists every
published Course as a card with its cover, title, teaser, price and lesson
count. The Sales Page at `/kurzy/<slug>` presents one Course: cover,
title, teaser, price, the full Section and Lesson outline, and a button
that starts the purchase.

Hard facts come from Directus, so publishing a Course is enough to put it
on sale. Long-form sales copy for a particular Course lives in an optional
Vue component that drops into one slot in the middle of the page. A Course
with no such component still renders a complete page.

An Author who logs in sees their drafts: draft Courses appear in the
Catalog with a „Koncept" badge, and a draft Sales Page renders instead of
returning 404. Directus decides this from the caller's own token, so no
visitor and no Student can reach an unpublished Course.

## User Stories

1. As a visitor, I want a page listing the Courses on offer, so that I can
   see what I could buy.
2. As a visitor, I want each Catalog card to show a cover image, title,
   teaser and price, so that I can tell Courses apart without opening
   them.
3. As a visitor, I want each card to show how many Lessons the Course has,
   so that I can judge its size.
4. As a visitor, I want the Catalog ordered deliberately rather than
   arbitrarily, so that the Course the Author considers most important
   comes first.
5. As a visitor, I want an explanatory message when no Course is published
   yet, so that I do not think the page is broken.
6. As a visitor, I want a „Kurzy" item in the main navigation, so that I
   can find the Catalog from any page.
7. As a visitor, I want a Sales Page per Course at a readable URL built
   from its slug, so that I can share the link.
8. As a visitor, I want the Sales Page to state the price in CZK in Czech
   formatting, so that I know what I will pay.
9. As a visitor, I want the full Section and Lesson outline on the Sales
   Page, so that I can see what the Course contains before paying.
10. As a visitor, I want video and text Lessons distinguished in the
    outline, so that I know what form the content takes.
11. As a visitor, I want a Course that needs richer persuasion to carry
    bespoke content in the middle of its Sales Page, so that the offer is
    made properly rather than in one generic block.
12. As a visitor, I want a clear button that starts the purchase, so that
    I can act on the decision.
13. As a visitor, I want both pages to work on a phone, so that I can read
    and buy from where I am.
14. As a visitor following a link to a Course that does not exist, I want
    the site's normal 404 page, so that I know the address is wrong.
15. As a visitor, I want no unpublished Course to be reachable or
    confirmable, so that unfinished content stays private.
16. As a visitor, I want the Sales Page to carry a title, description and
    social preview image, so that a shared link looks right.
17. As a search engine, I want published Courses in the sitemap and marked
    up as structured data with their price, so that they can be indexed
    and shown as results.
18. As a search engine, I want a canonical URL per Course, so that I index
    one address.
19. As an Author, I want a draft Course's Sales Page to render for me when
    I am logged in, so that I can check it before publishing.
20. As an Author, I want draft Courses in the Catalog marked „Koncept" and
    in their normal position, so that I can see how the list will look
    once they go live.
21. As an Author, I want publishing a Course in Directus to be all that is
    needed to put it on sale, so that I do not wait for a deploy.
22. As an Author, I want one plain text box for the teaser, so that it is
    obvious what to write and where it appears.
23. As an Author, I want the cover file picker to open in the folder whose
    files the public can read, so that covers do not silently fail to
    load.
24. As an Author, I want a Course with no bespoke content to still sell
    properly, so that I can launch a Course without a developer.
25. As a Student who already bought a Course, I want the Sales Page to
    keep working, so that a bookmarked link does not break. (An
    entitlement-aware button waits for area 04b.)
26. As a developer, I want the price to exist in exactly one place, so that
    the page, the Order and the payment cannot disagree.
27. As a developer, I want an explicit list of which Courses have bespoke
    components, so that I can see at a glance what is hand-built.
28. As a developer, I want a warning while developing when a bespoke
    component points at a Course that no longer exists, so that dead
    entries surface.
29. As a developer, I want the session concept in the auth layer to be
    named for what it holds, so that reading the code does not mislead me
    once Authors log in too.
30. As a developer, I want the Directus permission behaviour for an Author
    reading drafts covered by a probe, so that a policy change cannot
    quietly open or close the preview.
31. As a developer, I want a published, priced Course with a working cover
    to exist as a fixture, so that the pages can be verified before the
    client writes real content.

## Implementation Decisions

### Scope of the Catalog

Only On-demand Courses. The `course` collection has no form
discriminator and none is added, but the Catalog query filters explicitly
on published status rather than reading every row, so adding Live Courses
later cannot leak them into the shop by default. Live Courses stay on
their hand-written marketing pages, and the SimpleShop cutover is not part
of this area.

### Routes and navigation

`/kurzy` for the Catalog and `/kurzy/<slug>` for the Sales Page, both in
the `shop` layer, keyed on the unique `slug`. The Course Player gets its
own path later in area 06, so one URL never renders either a Sales Page or
a Player. „Kurzy" is added to the main navigation in the base app, the
same way area 02 added the account link.

A slug with no readable published Course returns 404 through
`createError`. Missing and unpublished are deliberately indistinguishable
to a visitor, and there is no redirect to the Catalog.

### Where content lives

Directus holds the hard facts: title, slug, teaser, cover, `price_czk`,
and the Section and Lesson outline. The `course.description` field becomes
the **teaser**: its interface changes from rich text to plain multiline,
and it is used on the Catalog card, at the top of the Sales Page, and as
the meta description. Its Czech note is reworded to say so.

Long-form sales copy lives in a per-Course Vue component in the `shop`
layer, resolved through an explicit registry that maps slug to component.
A slug missing from the registry is a valid state and yields a page
without the bespoke block. The registry emits a development-only warning
when one of its keys matches no Course. No build-time consistency check
exists, because a published Course with no component still renders
completely.

The bespoke component fills one slot between the hero and the outline. The
skeleton keeps ownership of cover, title, teaser, price, outline and the
purchase button, so those appear in the same place on every Course.

### Read path

Both pages fetch through Nitro routes rather than reading Directus in the
browser. Each route builds its Directus client from the caller's session
and falls back to the anonymous server client when there is none, so
Directus enforces who sees drafts. This is the decision recorded in
ADR 0004, and it departs from the marketing pages, which read Directus
with the anonymous client from the browser.

Sorting is applied as `sort` ascending with `id` ascending as tiebreaker
and null `sort` last, because `sort` is nullable and some existing rows
have it unset.

### Account rename

The auth layer's session plumbing is renamed from Student to **Account**,
because an Author logging in to preview a draft holds the same session and
the glossary reserves Student for the learner and buyer. The type,
composable, session helpers and Directus client helpers all move to
Account naming. The middleware names stay. Directus columns keep
`student`, since Orders, Entitlements and Progress do belong to Students.
This lands as the first tickets of this area, ahead of the pages that
consume it.

### Purchase button

One static button reading „Koupit kurz", linking to the order route that
area 04a will own. No session check and no entitlement check in this area.
Email verification stays on as area 02 shipped it, and 04a will make the
verification link return to the pending checkout.

### Price

`price_czk` is an integer in whole koruny and is publicly readable. One
shared formatter renders it as „1 490 Kč" with Czech spacing, and it is
the only place a price reaches the page. A price typed into copy, in the
skeleton or in a bespoke component, is a defect. The conversion to haléře
that GoPay requires happens once, at the payment call in area 04b, and
never in a display path.

### Metadata and structured data

Meta title, description and social image are derived from title, teaser
and cover, so no SEO fields are added to `course`. The social image is the
cover taken through a Directus image transformation at 1200×630, rather
than a separate field or a generated card.

Structured data uses the schema.org helpers already bundled with
`@nuxtjs/seo`: a Course entity with an offers block carrying the price and
CZK, breadcrumbs on both pages, and an item list on the Catalog. No
Product entity, because duplicating one thing as two entities invites
mismatch reports. The provider comes from the existing site configuration.
Whether Google grants a rich result is outside this area's control.

The sitemap gains a runtime source listing published Course URLs, since
Courses are published without a deploy. This is the one Nitro route in the
area that serves no session-dependent data.

### Cover images

Covers must live under a folder the public role can read, because that
permission is folder-scoped by name and the Author's own materials folder
is not public. A `Public/kurzy` folder is created and pinned as the
`cover` field's default, and the field note says why.

### Fixture data

A disposable published Course named `[TEST] Ukázkový kurz` is created with
a teaser, a priced value, a cover in `Public/kurzy`, and a few Sections
and Lessons, then recorded in the Directus fixture list. The client's own
dummy Course from the area 01 dogfood stays untouched and draft.

### No new dependencies

Everything needed is installed: the Directus SDK and the layer's client
factories, zod codecs for Course, Section and Lesson, `@nuxtjs/seo` for
sitemap and structured data, `@nuxt/image` with its Directus provider, and
`@lttr/puleo` for styling. Czech copy follows the typography skill.

## Testing Decisions

A good test here asserts behaviour someone can observe: what an anonymous
caller may read, what an Author may read, what a page renders. It never
asserts how a composable is wired.

Three existing seams carry it, and no new seam is introduced.

- **Directus permission probes** (`.probe.ts`, run on demand against the
  live instance). The existing anonymous visibility probe already covers
  published-only Course reads, the outline, and denial of
  `test_pass_threshold`, `unlock_rule` and Lesson bodies. This area adds
  the Author case: an Author token reads a draft Course and its outline,
  a Student token does not, and an anonymous caller does not. It also adds
  the cover case: a file in `Public/kurzy` is fetchable without a token,
  and a file in the materials folder is not. Prior art is the existing
  public visibility and author probes, which assert status codes and error
  codes rather than payload internals.
- **Unit tests** for the pure parts: the price formatter, including the
  Czech spacing and the non-breaking space; the Catalog comparator,
  including null `sort` and the id tiebreaker; and the registry lookup for
  a hit and a miss. Prior art is the existing unit tests for redirects,
  passwords and rate limiting.
- **The `verify` skill** for behaviour and appearance: drive the real app,
  load the Catalog and the Sales Page against the fixture Course, confirm
  the cover renders for an anonymous visitor, confirm the outline and the
  purchase button, and check both pages at 375px. The anonymous cover
  check matters because an authenticated screenshot would hide a
  folder-permission failure.

The auth layer rename is covered by the existing auth probe and unit
tests, which must keep passing unchanged in meaning.

## Out of Scope

- Checkout, Orders, consent checkboxes and payment (areas 04a and 04b).
- Any entitlement-aware behaviour on the Sales Page, including a „Přejít
  do kurzu" button for a Student who already bought.
- The Course Player, Progress, unlock rules and quizzes (areas 06 and 07).
- Meta Pixel or any other tracking event on these pages.
- Search, filtering, categories, tags and recommendations.
- Live Courses in the Catalog, and the SimpleShop cutover of the existing
  live-course pages and their hardcoded table.
- Discounts, strike-through prices, coupons, multiple currencies and VAT.
- A block or section builder in Directus for composing Sales Pages.
- Testimonials, FAQ, gallery, lecturer profiles and duration figures as
  structured fields. Durations arrive with area 09, and the rest belong
  in a bespoke component until a second Course needs the same thing.
- A preview mechanism using a service account or a secret URL.
- Cross-links from existing marketing pages into the Catalog.

## Open Concerns

- The Catalog must be checked once more against the client's first real
  Course before launch, and the `[TEST]` fixture removed or archived. The
  client decides when that Course is ready.
- Whether email verification stays mandatory during checkout is area 04a's
  call, informed by the flow it builds. This area's static button works
  either way.
- Whether Live Courses ever join the Catalog, and when the SimpleShop
  cutover happens, is unscheduled and belongs to the site owner.

## Further Notes

The area's entry in the epic's `areas.md` needs two corrections when this
starts: it depends on 00, 01 **and 02**, and its one-line description
still says content comes from Directus, which is now true only of the hard
facts.

Area 02's spec carries a note that checkout should measure the cost of
email verification. That note stays open and is answered in 04a.

The bespoke-component model rests on the Course count staying low, a few
new Courses a year. If the Catalog ever grows to dozens, the registry
becomes the wrong shape and a structured Sales Page model in Directus
becomes worth building.
