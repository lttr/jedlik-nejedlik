---
status: not-started
references:
  - "intent.md (this folder)"
  - "Pixel ID: 3144448269086284 (client e-mail, 2026-09)"
  - https://scripts.nuxt.com/scripts/tracking/meta-pixel
  - https://podpora.redbit.cz/navod/nastaveni-trekovacich-a-konverznich-nastroju/
  - https://podpora.redbit.cz/navod/webhooky/
  - https://www.facebook.com/legal/technology_terms
---

# Specifikace: Meta Pixel + souhlas s cookies

## Problem Statement

The client wants to advertise on Meta and needs the site to report conversions
back to it. Today the site measures nothing Meta can use: Plausible is
cookieless, there is no pixel, and no campaign has ever run.

Two things stand in the way of a snippet paste.

**The site has never asked for consent.** Nothing it loads sets a cookie. The
Meta Pixel does, so the pixel cannot arrive without the site's first consent
banner. The privacy policy also needs a correction: it claims
traffic-measurement cookies under legitimate interest, which describes neither
Plausible (cookieless) nor the pixel (consent-based).

**The checkout is not on the site.** Every buy button leaves for
`form.simpleshop.cz`. The marketer asked for `Purchase` on the buy button; that
would count every click as a sale and train ad delivery towards people who
click and do not pay.

## Solution

Load the Meta Pixel through Nuxt Scripts, gated behind a small consent banner of
our own, and measure two honest events on the three obesity Live Courses that
are actively sold.

- A visitor's first page view shows a bottom bar with **Přijmout** /
  **Odmítnout**. Nothing reaches Meta until they accept, not even the script
  request. The decision lives in their browser and can be changed later.
  Plausible is untouched: it needs no consent.
- `InitiateCheckout` fires on a buy-button click for one of the three Live
  Courses.
- `Purchase` fires on a thank-you page on our own domain. SimpleShop redirects
  the buyer there after payment ("URL po uhrazení"), so our consent decision is
  readable and the pixel is loaded or not accordingly. A static `kurz` query
  parameter, one per Live Course, identifies what was bought.
- The two in-person Live Courses move from the Google Form to their SimpleShop
  products, which is what makes them measurable.

## User Stories

**Visitor**

1. As a visitor, I want to be asked before any advertising cookie is set, with
   **Přijmout** and **Odmítnout** equally easy to click and a link to the privacy
   policy, so that I decide informed and refusing costs me nothing.
2. As a visitor who has not decided or has refused, I want no request to reach
   Meta at all, so that my choice is honoured rather than merely recorded.
3. As a visitor who has decided, I want the bar gone across pages and visits,
   with no flash of it on returning, so that the site does not nag me.
4. As a visitor who changed my mind, I want to reach the choice again from the
   footer and from the privacy policy, so that withdrawing is as easy as
   consenting.
5. As a visitor on a phone, I want the bar readable and tappable at 375px
   without blocking the content.
6. As a visitor reading the privacy policy, I want it to name Meta as the
   recipient, say that traffic measurement is cookieless, mention transfers
   outside the EU and tell me how to withdraw, so that the document matches
   what the site does.

**Buyer**

7. As a buyer of a Live Course, I want to land on a page that confirms my
   payment and tells me the confirmation and doklad arrive by e-mail, so that I
   am not left wondering or looking for a download.
8. As a buyer who refreshes that page or who refused cookies, I want nothing
   reported or double-counted, so that my refusal and the client's numbers both
   hold.
9. As a buyer of the e-book or the webinar, I want my current post-purchase
   page unchanged, so that the download I rely on still works.

**Site owner and marketer**

10. As the site owner, I want the pixel to load only in production, so that dev
    and the test site never pollute the ad data.
11. As the marketer, I want `Purchase` to mean a completed payment and
    `InitiateCheckout` a separate earlier step, each identifying its Live Course,
    so that I can optimise for real sales and see the funnel per product.
12. As the marketer, I want to verify events myself in Events Manager and to
    know that only consenting visitors are measured, so that I understand the
    numbers before spending budget.

## Implementation Decisions

### Scope of measurement

Events fire for **three Live Courses only**:

| Live Course                                                            | Id (`kurz` param)       | SimpleShop |
| ---------------------------------------------------------------------- | ----------------------- | ---------- |
| Online kurz pro rodiče dětí 3–7 let, start 11. 1. 2027                 | `online-3-7-2027-01`    | `yXRL9`    |
| Kurz (ne)hubnutí naživo 2.–5. třída, Hradec Králové, start 5. 10. 2026 | `nazivo-2-5-hk-2026-10` | `JmEVq`    |
| Kurz (ne)hubnutí naživo 6.–9. třída, Hradec Králové, start 22. 9. 2026 | `nazivo-6-9-hk-2026-09` | `RYlVD`    |

The webinar (`n05o4`) and the e-book (`gN5Qq`) get no events at all. Their
`Purchase` cannot be measured, since SimpleShop's own post-payment page is
their delivery mechanism, and an `InitiateCheckout` without a possible
`Purchase` would read as a 0% conversion rate rather than as an absence.

Ids are anchored on the start date, not the sales season, so they diverge
on purpose from the `2026-online-kurz-deti` route slug.

No `value`, `currency` or price on either event: revenue reporting is not
needed yet and the online course's instalment option makes the value
ambiguous. No `Lead` events on any form.

### Pixel loading

`@nuxt/scripts` with the Meta Pixel registry script, chosen because its consent
trigger is exactly the mechanism this feature is built around and it keeps
`fbq` typed. It is new to the project; there is no existing third-party-script
pattern to follow.

The script is gated with `scriptOptions.trigger: useScriptTriggerConsent()`,
not `defaultConsent: 'denied'`. Meta's `defaultConsent` queues a revoke but does
not delay the SDK request, so it is not a load gate. Do not combine with
Partytown, which ignores trigger timing.

Loading is production-only, mirroring the existing Plausible block in the Nuxt
config, with the pixel ID hardcoded there. The ID is public in every page's
source by design and identical across environments, so the "env vars from the
environment" rule does not apply.

Plausible stays outside the banner. It sets no cookies, so gating it would
discard good data for no legal gain.

### Cookie consent

Own component and composable, no CMP. One optional vendor does not justify a
hosted CMP's fee, script and cookies.

- Fixed, non-blocking bottom bar, mounted once so it covers both layouts.
  Rendered client-only, because the decision lives in `localStorage` and a
  server-rendered bar would hydration-mismatch for visitors who already
  decided.
- Two equally weighted buttons, short text, link to the privacy policy. No
  settings pane for a single switch.
- Stored in `localStorage` only as `{ status, decidedAt, version }`. Nothing
  goes to the server. `version` lets a later vendor change force a re-ask. No
  time-based expiry.
- Withdrawal is reachable from the footer's legal links and from the privacy
  policy's cookies section; both reopen the bar. It takes effect on the next
  page load, since `@nuxt/scripts` cannot unload a loaded script. Accepted.
- `@vueuse/core` is already a dependency for the storage composable.

### `InitiateCheckout`

One buy-link component owns both the anchor and the event, so a new buy button
cannot ship without tracking. It replaces the existing hardcoded anchors on the
three Live Course surfaces, keeping their classes, `target="_blank"` and
`rel="noopener"`. The event carries the Live Course id as its content name.

### `Purchase`

Fired on a thank-you page on our own domain, reached through SimpleShop's
per-product "URL po uhrazení".

Two alternatives were considered and rejected. Sending `Purchase` from
SimpleShop's payment webhook through Meta's Conversions API cannot honour the
banner: the webhook carries no browser state and there is no key to join it to
the visitor's consent decision, and the Conversions API itself has no consent
parameter. Embedding the SimpleShop form on our pages would let SimpleShop push
a proper `Purchase` into our pixel, but it changes the path money travels, so a
styling or iframe failure would stop sales rather than lose an event.

Mechanics:

- One page, three URLs differing only by a static `kurz` query parameter. The
  redirect field has no variable substitution, but the URL is ours to write.
- Unknown or missing `kurz` falls back to generic copy and a `Purchase` with no
  Live Course id, never an error.
- The event fires once per session, so a refresh does not double-count.
- The page is `noindex` and unlinked from navigation.
- Copy is course-specific (heading, start date) and states that the confirmation
  and doklad arrive by e-mail, since this page replaces SimpleShop's post-payment
  page where the download link lives. The client confirmed the doklad is
  e-mailed regardless.

### Live Course table

The three rows (SimpleShop URL, id, display name, start date) live in one
plain constant module under the app's utils, read by both the buy-link
component and the thank-you page.

Not in the empty `shop` layer, which is reserved for the future GoPay catalog;
this table will be deleted, not extended, once the checkout moves in-house. Not
a Directus collection either: five hardcoded facts do not warrant a fetch.

### In-person Live Courses move to SimpleShop

Both in-person course pages currently pass a Google Form URL as their order link.
They move to their SimpleShop products (`JmEVq`, `RYlVD`) and the questionnaire
step disappears. This reverses `5af4992` ("Point course sign-up at the
questionnaire"); the site owner confirmed the reversal.

### Privacy policy

A targeted edit to the existing cookies section, not a rewrite:

- Correct the legitimate-interest cookie claim; measurement is cookieless.
- Name Meta Platforms Ireland as the ad-targeting recipient, with purpose and a
  link to Meta's privacy policy.
- Add a sentence on transfers outside the EU.
- State how to withdraw consent and place the control there.

The section already reserves consent for ad-targeting cookies, so the pixel
fits its structure. The client signs off; no lawyer review in this task.

## Verification

No automated tests. Everything that matters here is runtime behaviour across a
third-party script, a browser and an external checkout, and neither an e2e nor
a unit test can reach it; a unit test on the small lookup and parsing helpers
would only assert what the code plainly says.

Checked in the `verify` pass instead:

- Before any decision and after **Odmítnout**, no request to Meta appears in
  the network tab. After **Přijmout**, requests appear. This is the legally
  load-bearing check.
- The bar shows on a first visit, disappears after either choice, stays gone
  across navigation, and reopens from the footer link and the policy page.
- Readable and tappable at 375px, and no hydration mismatch with a stored
  decision.
- The thank-you page shows the right copy for each of the three `kurz` values
  and generic copy for an unknown one.

Events arriving in Meta are confirmed by the marketer in Events Manager. A real
`Purchase` needs a paid order: a refunded test purchase or the first genuine
buyer.

## Out of Scope

- The Conversions API, until the checkout is ours.
- Embedding SimpleShop forms on our pages.
- Any measurement of the webinar or the e-book.
- `Lead` events, values, prices and revenue reporting.
- Consent expiry, a per-cookie table in the policy, lawyer review, an ADR.
- Anything built for the future GoPay checkout, including the `shop` and `lms`
  layers and the Directus `order_consent` collection.
- Retargeting audiences, catalog feeds or campaign setup in Meta.

## Follow-up

- A short note to the marketer: their snippet does not run as pasted (curly
  quotes cause a `SyntaxError`), `content_type` expects `product` or
  `product_group` so `'kurz'` is invalid, and `Purchase` now fires on a
  completed payment rather than the buy click.
- Record in the e-shop epic's area index that cookie consent was built here, so
  its lawyer-gated legal-documents area does not re-litigate it.

## Open Concerns

None. All three were closed by the site owner and the marketer on 2026-09-10:

- The marketer confirmed nothing beyond the event name `Purchase` is assumed:
  no `value`/`currency` expectation and no pixel on the SimpleShop side.
- The privacy-policy edit ships on the site owner's sign-off; no lawyer review.
- The first real `Purchase` will be a test order made once Meta's receiving end
  is ready. Not a blocker for this task.

## Further Notes

- SimpleShop allows no custom HTML on its post-payment page; its "JS, CSS a
  jiné kódy" field renders only on the sales page and form. That answers the
  intent's third question and rules out placing pixel code on SimpleShop's side,
  where our banner does not exist anyway.
- The existing `dekujeme-za-zajem-o-newsletter` page sets the naming shape for
  the new thank-you page.
