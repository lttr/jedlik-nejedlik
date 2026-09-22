# The shop layer

How `web/layers/shop` sells a Course: the read path, the Checkout, the pending
checkout cookie, GoPay and settlement, the return page and the mock gateway.
The _why_ behind the decisions is in the ADRs (
[0004](adr/0004-course-pages-read-through-nitro.md),
[0005](adr/0005-verified-email-before-any-session.md),
[0006](adr/0006-shop-writes-through-a-service-account.md)) and the area spec,
`.aiwork/2026-09-15_checkout-gopay/spec.md`, which the code cites as "spec,
user story N". Domain terms are in [`GLOSSARY.md`](../GLOSSARY.md).

## Server clients

The shop layer talks to Directus through three server clients. Two come from
elsewhere: the anonymous client (directus layer), used for public reads such as
the sitemap, and the caller-bound client (auth layer), which carries the
visitor's own session.

The third is the Shop Service Account (`getShopServiceDirectusClient`), whose
policy allows exactly the writes the payment flow needs: stamping a Payment id
on an Order, settling it, and granting an Entitlement (ADR 0006). Nothing else
may use it. A read a Student is allowed to make belongs on their own session,
so Directus stays the one place that decides what they may see (ADR 0004); the
Service Account could read every Entitlement there is.

The client is stateless, like the anonymous one, so the module keeps one per
process; the H3 event is only there to reach the runtime config.

## Catalog read path

Two shop routes read Courses from Directus: the Catalog and the Sales Page.
The query helpers live in `server/utils/course-query.ts`, server-only because
Directus query syntax is of no use to the Vue app.

`COURSE_PUBLIC_FIELDS` is the column list both routes select. It is kept in one
place so that a column added to `CourseSchema` reaches the Catalog and the Sales
Page together; otherwise whichever route was forgotten throws at parse time.
`status` is deliberately not in the list: only the Catalog renders it (the
„Koncept" badge), and it adds the column to its own selection.

`SHOP_COURSE_STATUSES` is the status filter both routes use, spread out of
`CourseStatusSchema` so that the filter and the parsers stay the same list.
(Spread rather than passed through, because the SDK's `_in` takes a mutable
`string[]` and rejects Zod's readonly tuple.) Asking for `draft` is safe: the
public policy filters on published, so a draft only ever comes back for an
Author's own token (ADR 0004). Sharing one list between the two routes means a
visitor cannot reach through one what the other hides.

`readCourseBySlug` is the single read of one Course by slug for the whole shop.
It runs on the caller's own client, so who may see a draft is Directus's
decision and an absent row is the shop's 404. Callers pick their own columns,
checked against the schema by `QueryFields`; the status filter and the 404 are
not theirs to change. The row comes back as `unknown`, because every caller
parses it with its own codec anyway, and a codec that trusts an inferred shape
checks nothing.

The Sales Page route (`server/api/courses/[slug].get.ts`) adds
`COURSE_OUTLINE_FIELDS`, the outline a visitor may read before buying, and
answers with ownership as well: a Student who already holds an Entitlement for
the Course is shown „Přejít do kurzu" instead of a buy button. The Entitlement
read uses the caller's session, never the Shop Service Account (ADR 0004). The
session is held apart from the read client because a visitor has no session and
the public policy grants no `entitlement` read at all, so asking would be a
refusal rather than an empty list.

## Sales Page

The Sales Page has one call to action, and it comes in three states (spec,
„Placement"):

- no price: the Course is unbuyable rather than free, so nothing is offered at
  all (user story 24);
- `entitled`: the owner is sent to „Moje kurzy" instead of being invited to
  buy twice, and the price stops being an offer to them (user story 20);
- otherwise: the invitation to buy.

`entitled` is the caller's own Entitlement as the Sales Page's Nitro route read
it. The browser never decides this.

## Sales content

Some Courses carry hand-built sales copy (spec, "Where content lives"). The
registry in `app/utils/sales-content.ts` maps a Course slug, exactly as
Directus holds it, to the component the Sales Page mounts between the hero and
the outline. A Course absent from the registry is the normal state: its Sales
Page renders complete without the block, and nothing checks the list at build
time. `orphanSalesContentSlugs` catches the other direction, a renamed or
removed Course leaving copy nobody can reach, and the Catalog page warns about
those in development.

Every entry is an async component, for two reasons: each Course's copy stays in
its own chunk instead of every bespoke block riding along with the page, and
the module stays importable without SFC compilation, so its unit test runs in
plain vitest.

Only persuasion belongs in such a component. The Sales Page skeleton owns the
cover, title, teaser, price, outline and button, and a price typed into the
bespoke copy is a defect (spec, "Price").

## Price

`formatPriceCzk` is the one place a price becomes text; a price typed into copy
or a component is a defect. `price_czk` is whole koruny, so there is nothing to
round.

Both spaces in the output are U+00A0 on purpose. Czech groups thousands with a
non-breaking space and never separates a number from its unit, and a plain space
would let a line break inside „1 490 Kč". The formatting is hand-rolled rather
than `Intl.NumberFormat("cs-CZ")` so the output does not depend on the ICU data
of whichever runtime renders it.

## Social preview image

The social preview of a Sales Page is the Course cover put through a Directus
image transformation: 1200×630 is the Open Graph size every network crops to,
and `fit=cover` keeps the frame filled whatever the cover's own aspect ratio.

The URL is built by hand rather than with `$img()`, because the `@nuxt/image`
Directus provider bakes its base URL in at build time while the Directus origin
the site really talks to is the runtime `directusUrl`, so the two could
disagree. The URL is absolute because crawlers reject a relative `og:image`.

## Checkout

The Checkout is two routes and one helper module,
`server/utils/checkout-order.ts`, which holds everything the Checkout does to
Directus and to GoPay so that the routes stay a few lines. Reads and the Order
write go through the Student's own session, which is what makes Directus the
one place that decides what they may see and place (ADR 0004); only the Payment
id is stamped by the Shop Service Account, because a Student may not write it
(ADR 0006).

`GET /api/checkout/<slug>` answers what the Checkout page needs to render
itself for whoever asked. Every refusal of the route is the page's refusal too:
404 means no readable Course, 409 a Course that cannot be bought, and the page
then never shows the form. A visitor without an Account is answered as well,
because step 1 of the Checkout is where they log in or register (ADR 0005):
they get the Course and no identity. What they may read is Directus's decision
either way.

`POST /api/checkout/<slug>` is the press on „Objednávka zavazující k platbě".
Its answer is the gateway URL the browser is sent to; everything else the press
does (the Billing Details on the Account, the Order, its Consent, the Payment)
happens on the way there. The request body carries no price: the amount is
re-read from the Course, so a tampered request buys nothing cheaper (spec, user
story 27), and anything else the browser sends is stripped by the schema. A
rejected body is told apart two ways, the consent checkbox and an over-long
Billing Detail, because „Tick the box" over a box the Student already ticked is
a refusal they cannot act on.

## Checkout page

`/objednavka/[slug]` shows all three steps on one page with the Course
alongside, variant C of `.aiwork/2026-09-15_checkout-gopay/prototype/index.html`,
which the Checkout components cite by that name. The three steps read as three
boxes, but steps 2 and 3 share one `<form>`, so a single press sends the
Billing Details, the Consent and the Order together.

The page carries no `auth` middleware on purpose: a visitor without an Account
gets the same page and logs in or registers inside step 1, because being sent
somewhere else is how a purchase loses sight of what it is buying (spec, user
story 2). When step 1 finishes, the page asks the Nitro route again; the
refreshed answer carries the Student's e-mail, their Billing Details and any
refusal their session brings with it, and it is also what mounts step 2 for the
first time, so that form reads the Billing Details straight from the fetched
data and nothing has to be pushed into it.

A 409 from the route is a Course this Student may not buy, and the page says so
in its own words rather than on the site's error page: „Tenhle kurz už máte"
for an Entitlement the Student already has (success tone), and the neutral
`info` tone for a Course that is not on sale yet, which is nobody's fault. The
refusal is computed rather than read once, because logging in inside step 1
asks the route again and may be refused only then. Any other error goes to the
site's error page; an unreadable Course is a 404 worded like Nuxt's own route
miss, so a draft cannot be told apart from a slug that never existed (ADR
0004).

Step 1's two ways into an Account sit side by side in a tablist („Mám účet" and
„Jsem tu poprvé"). `role="tablist"` is a promise the rest of the widget has to
keep: each tab names the panel it controls, the panel names its tab back, and
only the selected tab is in the tab order; arrow keys move between them, which
is what a screen reader tells its user to press. Arrow keys wrap, as a tablist
is expected to; the strip only ever holds two tabs, so left and right do the
same thing, but spelling both out is less surprising than one of them doing
nothing. Focus has to follow the selection, not just the highlight: the tab
left behind drops out of the tab order the moment it is deselected, so a
keyboard user whose focus stayed on it would be stranded, and the next arrow
key would be handled by the old tab and compute the same move again.

## Pending checkout

A visitor without an Account who opens a Checkout has the Checkout's slug
remembered in a cookie, so that registering, walking to their inbox and
following the verification link brings them back to the Course they were
buying (ADR 0005). The cookie carries the Course slug and nothing else: it is
set on an unauthenticated request, so it must say as little as possible, and
every use of it is validated in `shared/utils/pending-checkout.ts`.

The cookie is set by a server middleware
(`server/middleware/pending-checkout.ts`) rather than by the Checkout route
itself, because a Checkout opens in two ways and the cookie has to survive
both. A first load renders on the server, where the route runs inside SSR's
internal `$fetch` and its `Set-Cookie` never reaches the browser (the same
reason `account-session.ts` skips `/api/`). A client-side navigation only ever
hits `/api/checkout/<slug>`. Middleware runs on the outer request either way,
the one whose response the browser actually gets. The middleware guards its
session read the way `account-session.ts` does: reading the session of a
request that carries no session cookie would mint one, and anonymous traffic is
most of what opens a Checkout.

`POST /api/pending-checkout` hands the remembered slug to the login page and the
verification landing and clears the cookie in the same breath. It is a `POST`
because reading it consumes it, and it sits outside `/api/checkout/` so that it
can never be mistaken for a Course slug by the router.

On the browser side the cookie is `httpOnly`, so the only way to ask what is in
it is to consume it through that route, which is what both callers want to do
anyway. Reading it is never fatal. Both callers ask for it _after_ the
irreversible step has already succeeded (a verification token is spent, a
session is live) and they ask inside the form's `submit`, where a rejection
would be shown as „something went wrong" and swallow the navigation with it. A
cookie that could not be read costs the detour back to the Checkout, nothing
more; it expires on its own a day later.

The e-mail typed in step 1 is kept in browser storage
(`useRememberedCheckoutEmail`) so that the other tab, the one the verification
link opens, can pre-fill it (ADR 0005). The password is never kept anywhere.
Two options there are load-bearing: `initOnMounted` keeps the server render and
the first client render equal, which a value only the browser has would
otherwise break, and `flush: "sync"` matters because both writers set the value
and are then unmounted by the very state change that follows (the step swaps
its panel), so a queued write would be dropped along with the watcher that owns
it.

## Payment and GoPay

GoPay ships no Node SDK and the third-party packages are years stale, so the
four calls the shop needs (token, create, inquire, refund) are written out over
raw `$fetch` in `gopay-api-client.ts`. `gopay-client.ts` is the one place that
decides which GoPay the site talks to; everything else takes a `GopayClient`
and never learns which one it got. Sandbox and production differ only in base
URL, and `mock` is refused outside development by the runtime-config schema.

What a Payment's state means for the Order that owns it:

| GoPay state             | Order       |
| ----------------------- | ----------- |
| `PAID`                  | `paid`      |
| `CANCELED`, `TIMEOUTED` | `cancelled` |
| anything else           | unchanged   |

„Unchanged" (`undefined` from `orderStatusForPaymentState`) means the state is
not an outcome yet, or it is one this area does not act on: a refund is made by
hand in GoPay's admin, and a paid Order stays paid.

`GET /api/gopay/notify` is GoPay's server-to-server notification: a bare GET
carrying only the Payment id. Nothing in it is trusted (the id is a lookup key
and the state always comes from an inquiry) so the route is public, with no IP
allow-list and a per-IP budget instead (spec, user story 32). An id no Order
carries is answered 200, because a retry would never find it either. A failure
during settlement is reported to Sentry and answered 500 deliberately: the 500
is what makes GoPay retry, and money taken without the Course being opened is
the one failure that has to be noticed within minutes (spec, user story 31).

## Mock gateway

The mock payment gateway is a Nuxt layer of its own, `mock-gopay/`. The shop
layer extends it only when `NUXT_GOPAY_ENV` is `mock`, so a sandbox or
production build contains neither its page nor its routes at all; the
runtime-config schema is the second guard, refusing `mock` outside development.

The layer sits inside `layers/shop` rather than beside it: Nuxt auto-discovers
`layers/*` and would otherwise register it unconditionally, leaving no place to
make that decision. Because it is nested, the path passed to `extends` has to be
absolute; a relative one resolves against the project root, not against the
layer. And because the layer is absent from most builds, Nuxt generates no
auto-imports for it, so its files import everything they use explicitly.

`gopay-mock-client.ts` is the GoPay stand-in that never leaves the machine.
`createPayment` hands back a `gw_url` pointing at the dev-only gateway page; the
buttons there record the state, which is what `inquirePayment` then reports.
State lives in process memory and is gone on restart: a dev fixture, not a
store.

A payer has two decisions at this gateway, „Zaplatit" and „Zrušit". The page
posts a plain form to `payments/[id]/decide`, and so can any HTTP client
(`{"action":"pay"}` as JSON works just as well), which is how a flow test pays
without a browser. The order of what happens is GoPay's: record the state,
notify the site server-to-server, then send the payer back. The notification is
awaited, so by the time the redirect is answered the site has already settled
the Order and a flow test can assert straight after the call returns.

`choose` is a third, button-less action. It puts the Payment in
`PAYMENT_METHOD_CHOSEN`, GoPay's „the payer picked a method, the bank has not
answered yet", the state the return page's pending branch and the
notification's „writes nothing" case are about.

`POST /api/gopay/mock/payments` creates a Payment the way the Checkout will, so
the gateway can be walked by hand or by a flow test before, or without, an
Order. It goes through the same `getGopayClient(event)` seam as everything else,
so what it exercises is the real code path.

## Settlement

`server/utils/settle-payment.ts` is the one place where money turns into
access. Both the public notification route and the Student's return page call
it and nothing else, so there is a single answer to „is this Payment settled"
and a single write path to get there.

Every branch is idempotent by construction: the Order's status decides what is
left to do, and the Entitlement's unique index on (student, course) is the last
line of defence when two callers arrive at once. The Order's `gopay_payment_id`
is unique, which is what makes it the idempotency key, and the lookup by that id
happens before GoPay is asked anything, so a forged notification costs one
Directus read and never reaches GoPay's API (spec, user story 32). The state
itself never comes from the notification, only from an inquiry.

The return route answers, and the return page renders, the outcome plus the
Course it is about: its title to name it, its slug for „Zkusit znovu". Both
Course fields are empty when the Course stopped being readable between the
Order and the return (unpublished, archived). The Course is only how the page
words the outcome, so that costs the wording, never the outcome: the page drops
the title and the „Zkusit znovu" link and says the rest anyway.

## Return page

`/objednavka/[id]/navrat` is where GoPay sends the Student back. The route
settles the Payment on the way, so the page only reports an outcome and never
grants anything itself (spec, user story 25).

`server/utils/order-return.ts` builds what they see. The Order is read with
their own session, so Directus is the one place that decides it is theirs (ADR
0004); another Student's Order simply is not there, and answers the same 404 as
an id that never existed.

The Student usually arrives before GoPay's notification does, so the page
settles too, through the same function, so that the outcome cannot differ. An
inquiry that fails is not the Student's problem: they are shown the Order as it
stands, which is the pending state, and GoPay's own notification (retried up to
twenty times) settles it behind them.

The Course is read with `readFirstRow`, not `readOnlyRow`: a Course turned back
into a draft or archived after the Order was placed is no longer readable to the
Student, and Directus answers that with no row. The outcome of a Payment must
never hang on the Catalog; a Student who has just paid has to be told so, even
when the page can no longer name what they bought.

On the page, a pending Payment is asked about again for half a minute before the
Student is sent on their way (spec, user story 17). Two VueUse timers give one
answer to „when does this stop polling": the interval stops itself the moment
the Payment is no longer pending, and a 30-second timeout stops it for good and
switches the message to the one that tells the Student they need not wait here.
Both are started on mount, because neither belongs on the server.

## Sitemap and metadata

`sitemap.xml` takes its Courses from a runtime source registered in the shop
layer's `nuxt.config.ts` under `sitemap.sources`
(`server/api/__sitemap__/courses.get.ts`), so a Course goes live in the sitemap
the moment it is published, with no deploy.

The route reads with the anonymous client on purpose, never the caller's: the
sitemap is public data and must read the same for everyone, so an Author's
session fetching it must not leak their drafts. The `status` filter is belt and
braces on top of the public policy, which already returns published rows only.
There is no `lastmod`, because the public policy does not expose `date_updated`.
