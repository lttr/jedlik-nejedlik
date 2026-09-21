---
reviewed_sha: 8457b73
fixes_sha: 0e3ae01
date: 2026-09-18
effort: xhigh
verified: [checks, probes, behaviour]
---

# Review — Area 04: Checkout + GoPay

Branch review of `master..HEAD` on `checkout-gopay` (tickets 01–06, 99 files,
~6 700 added lines), read at `8457b73` by `/code-review xhigh --fix` in a fresh
context, after `/simplify` had already run. Fifteen findings, seven of them
correctness. Fixes landed in `0e3ae01` and were driven in the running app before
being committed.

## Correctness findings and resolutions

| #   | Severity | Finding                                                                                                                                                                                                                                                                                                                                                                                                                     | Resolution                                                                                                                                                                                |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | High     | **Production-only, invisible to every test.** `PaymentSchema` defaults a missing `gw_url` to `""` and the Order-reuse path guarded only against `undefined`. A real GoPay _inquiry_ answer carries no `gw_url`, so a Student returning to a live Payment got `navigateTo("")` — the Checkout reloading forever, with no way through for that Order. The mock always returns a `gw_url`, which is why the flow probe passes. | Fixed: `liveGatewayUrl` rejects `""` as well, and `startPayment` throws if GoPay creates a Payment with no gateway page — after stamping the Payment id, so the Payment stays settleable. |
| 2   | High     | A Course unpublished between the Order and GoPay's return turned the return page into a 404 — **after the money was taken**, and on every later reload. The Student policy filters `course` on `status = published`, and `readOrderCourse` used the throwing read.                                                                                                                                                          | Fixed: `readFirstRow`, and the view carries `""` for an unreadable Course. Both notices read correctly without the name; „Zkusit znovu" is withdrawn when there is no slug.               |
| 3   | Medium   | Every body-validation failure answered „Bez souhlasu s obchodními podmínkami objednávku dokončit nejde." — including a billing field over the 200-character cap. The box was already ticked, so the purchase was unfinishable.                                                                                                                                                                                              | Fixed: the route reads the Zod issue paths and answers `invalid_billing` for a billing field, `consent_required` only for the checkbox. All six inputs gained `maxlength`.                |
| 4   | Medium   | `takePendingCheckoutSlug` ran **after** the verification token was spent. A transient failure of `/api/pending-checkout` turned a successful verification into a visible error with no navigation, and retrying re-posted a token Directus had already burnt. Same shape on the login page.                                                                                                                                 | Fixed in one place: it catches, warns and returns `null`.                                                                                                                                 |
| 5   | Medium   | `account/Billing.vue` aliased the `useFetch` payload instead of copying it, so every keystroke mutated the cached answer under `account:billing` — which `/muj-ucet` also prefetches. A failed save left the cache looking as if the write had succeeded.                                                                                                                                                                   | Fixed: `ref({ ...data.value })`.                                                                                                                                                          |
| 6   | Medium   | The settlement route carried no rate limit, though every call can trigger a GoPay inquiry and a Student can loop it against any of their own Orders. Every other new route has a budget.                                                                                                                                                                                                                                    | Fixed: `SETTLEMENT_RATE_LIMIT` (bucket `settlement`, 120 per 15 min). Tripped at request 104 in the app, answering 429 with the Czech message.                                            |
| 7   | Low      | `liveGatewayUrl` sat outside `placeCheckoutOrder`'s try/catch, so a Directus failure escaped unwrapped as a 500 with no Czech message and no `[shop]` log context.                                                                                                                                                                                                                                                          | Fixed: moved inside the try, producing the shop's 502.                                                                                                                                    |

## Conventions and accessibility

| #   | Finding                                                                                                                                                                                                                          | Resolution                                                                                                                                                                                                                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8   | `GuestPanel` announced `role="tablist"`/`role="tab"` without `aria-controls`, a `tabpanel` or roving `tabindex` — a widget it did not implement, on the only path a visitor without an Account has to buy.                       | Fixed, then **the fix itself was found broken in the app and fixed properly**: the roving `tabindex` moved selection but not focus, so the handler stayed on the old tab and a keyboard user reached the second tab once and could never return — strictly worse than the plain buttons. `select()` now awaits `nextTick()` and focuses the new tab. |
| 9   | Czech one-letter prepositions and conjunctions (`v s k z u o`, `a i`) without `&nbsp;` in six places, against the rule every other string in the diff follows.                                                                   | Fixed. `CheckoutStep`'s `title` is interpolated, not markup, so those two use a literal U+00A0 — an entity would render verbatim. Confirmed in the rendered DOM.                                                                                                                                                                                     |
| 10  | Dead `shopMessages.gatewayUnavailable`; `assertCallbackUrl` called twice for the same URLs and not at all on the mock path; a load-bearing comment in `account-session.ts` made false by this branch's own Student `read` grant. | All three fixed: message removed, the check kept at the client seam where the unit test asserts it, comment corrected.                                                                                                                                                                                                                               |

## Reported, deliberately not fixed

- **`muj-ucet.vue`'s prefetch duplicates each section's `useFetch` key and default.** The general fix (`lazy: true` in the sections) changes SSR output and risks a hydration mismatch, so it needs a deliberate decision rather than a wrap-up edit.
- **`emptyBillingDetails()` runs a Zod parse to build six empty strings, and `zod` ships to the browser for `/objednavka/*` and `/muj-ucet`.** Removing the parse needs the `as` cast the lint gate refuses, and `readRefusal` keeps zod on those routes regardless.
- **`toBillingPayload`'s spread** looks redundant but is what gives the payload all six keys without a cast. Commented as such.

Three larger structural findings from `/simplify` — the inverted auth→shop
dependency, the mock GoPay client shipping in production bundles, and
`<ShopNotice>` being locked inside the shop layer — are recorded with their
reasons in `implementation-notes.md`. Each needs the verified flows re-driven,
so none belongs to this branch's wrap-up.

## Gates

`vp run check:all` green (145 unit tests, eslint, oxlint, typecheck, fallow,
format). `vp run directus:probe` green (130 passed; `shop-service.probe.ts`
skips because `DIRECTUS_PROBE_SHOP_TOKEN` is absent from `web/.env`,
pre-existing since ticket 01).

Behaviour: the whole journey driven end to end through the mock gateway at
desktop and 375 px — guest registration, login, the three Checkout steps, the
gateway, all three return states with the poll measured at 3 s up to 30 s,
„Moje kurzy", „Fakturační údaje", and the Sales Page in all three button
states. Every review fix was exercised on its own surface, including an
unpublished Course at the return page and a forced `/api/pending-checkout`
failure. All Directus rows created during the passes were deleted.

## Still owed by a human

- **The genuine verification link has never been walked.** A real token is a JWT
  signed with the instance `SECRET`; both passes used a `STUB-OK` stub, reverted
  each time. One manual round-trip through a real inbox closes it.
- **Sentry delivery was never observed**, only the `captureException` call next
  to a 500. Needs someone to look at the Sentry project after a deliberate
  failure on a deployed instance.
- **Nothing here has ever talked to a real GoPay.** Finding 1 is exactly the
  class of bug that only sandbox credentials would have caught, and it was found
  by reading rather than by running. Tracked in `../2026-09-15_gopay-go-live/`.
