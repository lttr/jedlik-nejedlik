# The shop layer

How `web/layers/shop` sells a Course: the read path, the Checkout, the pending
checkout cookie, GoPay and settlement, the return page and the mock gateway.
The reasons behind the decisions are in ADRs
[0004](adr/0004-course-pages-read-through-nitro.md),
[0005](adr/0005-verified-email-before-any-session.md) and
[0006](adr/0006-shop-writes-through-a-service-account.md) and in the area spec,
`.aiwork/2026-09-15_checkout-gopay/spec.md`, which the code cites as "spec,
user story N". Domain terms are in [`GLOSSARY.md`](../GLOSSARY.md).

## Server clients

The shop talks to Directus through three server clients. The anonymous client
(directus layer) serves public reads such as the sitemap. The caller-bound
client (auth layer) carries the visitor's own session. The third is the Shop
Service Account (`getShopServiceDirectusClient`).

The Service Account may only do the writes the payment flow needs: stamping a
Payment id on an Order, settling it, granting an Entitlement (ADR 0006). Reads
a Student is allowed to make stay on their own session, so Directus remains
the one place that decides what they may see (ADR 0004). The client is
stateless, so the module keeps one per process.

## Catalog read path

The Catalog and the Sales Page read Courses through the helpers in
`server/utils/course-query.ts`.

- `COURSE_PUBLIC_FIELDS` is the column list both routes select, so a column
  added to `CourseSchema` reaches both at once. `status` is left out, because
  only the Catalog renders it, and that route adds it to its own selection.
- `SHOP_COURSE_STATUSES` is the status filter both routes use, spread out of
  `CourseStatusSchema` so filter and parsers stay one list. Asking for `draft`
  is safe: the public policy filters on published, so a draft only comes back
  for an Author's own token (ADR 0004).
- `readCourseBySlug` is the single read of one Course by slug. It runs on the
  caller's own client, so Directus decides who may see a draft and an absent
  row is the shop's 404. It returns `unknown` because every caller parses with
  its own codec.

The Sales Page route (`server/api/courses/[slug].get.ts`) also selects
`COURSE_OUTLINE_FIELDS` and answers whether the caller already holds an
Entitlement. That read uses the caller's session, never the Service Account
(ADR 0004).
It is skipped for a visitor without a session, because the public policy
grants no `entitlement` read and would refuse rather than return nothing.

## Sales Page

The one call to action has three states (spec, „Placement"). Without a price
the Course is unbuyable and nothing is offered (user story 24). An `entitled`
owner is sent to „Moje kurzy" instead of being sold the Course twice (user
story 20). Otherwise it is the invitation to buy. `entitled` comes from the
Nitro route, never from the browser.

## Sales content

`app/utils/sales-content.ts` maps a Course slug, exactly as Directus holds it,
to a bespoke copy component the Sales Page mounts between hero and outline. A
Course absent from the registry renders complete without the block.
`orphanSalesContentSlugs` catches the other direction, copy whose Course was
renamed or removed, and the Catalog page warns about it in development.

Entries are async components so each Course's copy is its own chunk and the
module stays importable in plain vitest. Only persuasion belongs there: the
skeleton owns cover, title, teaser, price, outline and button, and a price
typed into copy is a defect (spec, "Price").

## Price

`formatPriceCzk` is the one place a price becomes text. `price_czk` is whole
koruny. Both spaces in „1 490 Kč" are U+00A0, because Czech groups thousands
with a non-breaking space and never separates a number from its unit. The
formatting is hand-rolled so the output does not depend on the runtime's ICU
data.

## Social preview image

The Open Graph image is the Course cover through a Directus transformation,
1200×630 with `fit=cover`. The URL is built by hand rather than with `$img()`,
because the `@nuxt/image` Directus provider bakes its base URL in at build time
while the real origin is the runtime `directusUrl`. It is absolute because
crawlers reject a relative `og:image`.

## Checkout

Two routes and one helper module, `server/utils/checkout-order.ts`, which
holds everything the Checkout does to Directus and GoPay. Reads and the Order
write go through the Student's own session (ADR 0004). Only the Payment id is
stamped by the Service Account, because a Student may not write it (ADR 0006).

`GET /api/checkout/<slug>` answers what the page needs to render for whoever
asked. 404 means no readable Course, 409 a Course that cannot be bought, and
the page then never shows the form. A visitor without an Account gets the
Course and no identity, because step 1 is where they log in or register (ADR
0005).

`POST /api/checkout/<slug>` is the press on „Objednávka zavazující k platbě".
It saves the Billing Details, creates the Order, its Consent and the Payment,
and answers with the gateway URL. The body carries no price: the amount is
re-read from the Course (spec, user story 27), and everything else is stripped
by the schema. A rejected body distinguishes the consent checkbox from an
over-long Billing Detail, because „Tick the box" over a ticked box is a refusal
the Student cannot act on.

## Checkout page

`/objednavka/[slug]` shows all three steps on one page with the Course
alongside, variant C of the prototype in
`.aiwork/2026-09-15_checkout-gopay/prototype/index.html`. Steps 2 and 3 share
one `<form>`, so a single press sends Billing Details, Consent and Order
together.

The page has no `auth` middleware on purpose. A visitor logs in or registers
inside step 1, because a redirect is how a purchase loses sight of what it is
buying (spec, user story 2). When step 1 finishes, the page asks the route
again. The refreshed answer carries the Student's e-mail and Billing Details
and is what mounts step 2, so that form reads straight from the fetched data.
The refusal is computed rather than read once, because that second ask may be
the one that is refused.

A 409 is worded on the page itself: „Tenhle kurz už máte" for an existing
Entitlement, a neutral `info` tone for a Course not on sale yet. A 404 is
worded like Nuxt's own route miss, so a draft cannot be told apart from a slug
that never existed (ADR 0004).

Step 1's two ways into an Account („Mám účet" and „Jsem tu poprvé") are a
`role="tablist"` with the full keyboard contract. Each tab names its panel,
only the selected tab is in the tab order, and arrow keys move and wrap. Focus
follows the selection, so a keyboard user is never left on a tab that just
dropped out of the tab order.

## Pending checkout

A visitor without an Account who opens a Checkout gets its slug in a cookie.
Registering and following the verification link then brings them back to the
Course (ADR 0005). The cookie carries the slug and nothing else, since it is
set on an unauthenticated request, and `shared/utils/pending-checkout.ts`
validates every use.

A server middleware (`server/middleware/pending-checkout.ts`) sets it rather
than the Checkout route. A first load runs the route inside SSR's internal
`$fetch`, whose `Set-Cookie` never reaches the browser, and a client navigation
only hits the API. Middleware runs on the outer request either way.
It skips the session read when no session cookie is present, because reading
would mint one.

`POST /api/pending-checkout` hands the slug to the login page and the
verification landing and clears the cookie in the same call. It is a `POST`
because reading consumes it, and it sits outside `/api/checkout/` so the router
cannot take it for a slug. The cookie is `httpOnly`, so this route is the only
way to read it. Reading is never fatal: both callers ask after the irreversible
step has succeeded, and a failed read costs only the detour back. The cookie
expires a day later.

The e-mail typed in step 1 is kept in browser storage
(`useRememberedCheckoutEmail`) so the tab the verification link opens can
pre-fill it (ADR 0005). The password is never kept. `initOnMounted` keeps the
server and first client render equal, and `flush: "sync"` is required because
both writers are unmounted by the very state change that follows their write.

## Payment and GoPay

GoPay ships no Node SDK and the third-party packages are stale, so the four
calls the shop needs (token, create, inquire, refund) are written over raw
`$fetch` in `gopay-api-client.ts`. `gopay-client.ts` decides which GoPay the
site talks to, and everything else takes a `GopayClient`. Sandbox and production
differ only in base URL, and `mock` is refused outside development by the
runtime-config schema.

| GoPay state             | Order       |
| ----------------------- | ----------- |
| `PAID`                  | `paid`      |
| `CANCELED`, `TIMEOUTED` | `cancelled` |
| anything else           | unchanged   |

Unchanged (`undefined` from `orderStatusForPaymentState`) covers states that
are not an outcome yet and ones this area does not act on. Refunds are made by
hand in GoPay's admin, and a paid Order stays paid.

`GET /api/gopay/notify` is GoPay's server-to-server notification, a bare GET
carrying only the Payment id. The id is a lookup key and the state always comes
from an inquiry, so the route is public with a per-IP budget and no allow-list
(spec, user story 32). An unknown id is answered 200, because a retry would
never find it either. A failure during settlement is reported to Sentry and
answered 500, which makes GoPay retry (spec, user story 31).

## Mock gateway

The mock gateway is a Nuxt layer of its own, `mock-gopay/`, extended only when
`NUXT_GOPAY_ENV` is `mock`, so other builds contain none of it. It sits inside
`layers/shop` because Nuxt auto-discovers `layers/*` and would register a
sibling unconditionally. Consequences of the nesting: the `extends` path must
be absolute, and because the layer is absent from most builds it gets no
auto-imports, so its files import everything explicitly.

`gopay-mock-client.ts` is the stand-in. `createPayment` returns a `gw_url` to
the dev-only gateway page, the buttons there record the state and
`inquirePayment` reports it. State lives in process memory.

The page posts a plain form to `payments/[id]/decide`. `{"action":"pay"}` as
JSON works too, which is how a flow test pays without a browser. The order is
GoPay's: record the state, notify the site server-to-server, then redirect. The
notification is awaited, so a flow test can assert right after the call
returns. A third, button-less action, `choose`, puts the Payment in
`PAYMENT_METHOD_CHOSEN`, the state the return page's pending branch is about.

`POST /api/gopay/mock/payments` creates a Payment the way the Checkout would,
through the same `getGopayClient(event)` seam, so the gateway can be walked
without an Order.

## Settlement

`server/utils/settle-payment.ts` is the one place where money turns into
access. The notification route and the return page both call it, so there is
one answer to „is this Payment settled" and one write path.

Every branch is idempotent. The Order's status decides what is left to do, and
the Entitlement's unique index on (student, course) is the last line of defence
against two callers at once. The Order's unique `gopay_payment_id` is the
lookup key, and the lookup happens before GoPay is asked anything, so a forged
notification costs one Directus read (spec, user story 32). The state itself
comes only from an inquiry.

The settlement result carries the Course's title and slug for the page's
wording. Both are empty when the Course stopped being readable after the Order
was placed. That costs the wording, never the outcome.

## Return page

`/objednavka/[id]/navrat` is where GoPay sends the Student back. The route
settles on the way, so the page only reports and never grants anything (spec,
user story 25). `server/utils/order-return.ts` reads the Order with the
Student's own session, so another Student's Order answers the same 404 as an id
that never existed (ADR 0004).

The Student usually arrives before the notification, so the route settles too,
through the same function. A failed inquiry shows the Order as it stands,
pending, and GoPay's notification (retried up to twenty times) settles it
behind them. The Course is read with `readFirstRow`, since a Course that went
back to draft is no longer readable and a paid Student must still be told they
paid.

A pending Payment is polled for half a minute before the Student is sent on
(spec, user story 17). The interval stops itself when the Payment leaves
pending, and a 30-second timeout stops it for good and switches the message.
Both start on mount, because neither belongs on the server.

## Sitemap and metadata

`sitemap.xml` takes its Courses from a runtime source
(`server/api/__sitemap__/courses.get.ts`, registered under `sitemap.sources`
in the layer's `nuxt.config.ts`), so a published Course appears without a
deploy. The route reads with the anonymous client, never the caller's, so an
Author's session cannot leak drafts into public data. There is no `lastmod`,
because the public policy does not expose `date_updated`.
