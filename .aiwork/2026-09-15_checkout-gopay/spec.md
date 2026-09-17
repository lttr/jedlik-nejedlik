---
status: in-progress
blocked_by: ""
verified: []
references:
  - "Grilling decisions: grilling.md (rounds in grill-round-1.md … grill-round-3.md)"
  - "Prototype (verdict: variant C): prototype/index.html"
  - "Epic: ../2026-06-09_kurzy-platforma/areas.md (areas 04a + 04b)"
  - "ADR 0001: ../../docs/adr/0001-directus-system-of-record.md"
  - "ADR 0002: ../../docs/adr/0002-nitro-mediated-auth-sessions.md"
  - "ADR 0004: ../../docs/adr/0004-course-pages-read-through-nitro.md"
  - "ADR 0005: ../../docs/adr/0005-verified-email-before-any-session.md"
  - "Data model: ../2026-07-22_directus-data-model/spec.md (order, order_consent, entitlement)"
  - "Auth: ../2026-08-19_auth-customers/spec.md (redirect param, verification)"
  - "Catalog: ../2026-09-14_catalog-sales-pages/spec.md (purchase button, price)"
  - "Directus workflow: ../../docs/directus.md"
  - "Go-live follow-up: ../2026-09-15_gopay-go-live/spec.md"
---

# Spec — Area 04: Checkout + GoPay

Decisions were settled by grilling on 2026-09-15 (`grilling.md`); the guest
flow was settled by a prototype (`prototype/index.html`, verdict variant C).
This area merges the epic's 04a (Order + Consent + redirect) and 04b
(notification + Entitlement grant), because neither is useful alone.

## Problem Statement

A visitor can see a Course on its Sales Page and read its price, and the
„Koupit kurz" button leads to a route that does not exist. Nobody can buy an
On-demand Course, so nothing on the platform can grant an Entitlement, and the
Student has no page that shows what they own.

The association sells today through SimpleShop, which R-4 retires: it takes
money but cannot tell the platform to open the Course.

## Solution

A Checkout at `/objednavka/<slug>` for a logged-in Student, built as three
steps on one page with the Course recap alongside: **Účet** (log in or
register in place), **Údaje a souhlas** (Billing Details, one Consent
checkbox), **Platba** (a button that reads „Objednávka zavazující k platbě"
and sends the Student to GoPay). Payment happens on GoPay's page. GoPay
notifies the site server-to-server; the site re-reads the Payment state from
GoPay, marks the Order paid and grants the Entitlement, exactly once per
Payment. The Student comes back to a return page that shows the outcome and
finds the Course under „Moje kurzy" on their Account page.

Without GoPay credentials the whole flow runs against a mock gateway, so it
can be developed, verified and demonstrated locally.

## User Stories

1. As a visitor, I want the „Koupit kurz" button to open an order page for that Course, so that I can buy it.
2. As a visitor without an Account, I want to log in or register directly on the order page, so that I do not lose sight of what I am buying.
3. As a visitor who registers during the order, I want the verification link in my e-mail to bring me back to the same order, so that I can continue where I left off.
4. As a visitor who just verified my e-mail, I want to type only my password to continue, so that the interruption is as short as possible.
5. As a visitor, I want to be told before registering that I will use the password once more after verifying my e-mail, so that the second prompt is not a surprise.
6. As a Student, I want to see the Course title, cover, price, how it is delivered and how long I keep access before I pay, so that I know what I am buying.
7. As a Student, I want to enter my name for the invoice once and have it remembered on my Account, so that the next purchase is faster.
8. As a Student buying for my employer, I want optional company, IČO and address fields, so that I can get an invoice in the company's name.
9. As a Student, I want the order page to work without any Billing Details, so that a name is never a wall between me and the Course.
10. As a Student, I want one checkbox agreeing to the terms with a link to them, so that I know what I agree to without legalese.
11. As a Student, I want to see which privacy policy applies, without being asked to consent to it, so that the form stays honest and short.
12. As a Student, I want the final button to say plainly that it commits me to pay, so that I am not tricked into an order.
13. As a Student, I want to be sent to GoPay in Czech with my e-mail pre-filled, so that paying takes as few steps as possible.
14. As a Student who abandons the payment, I want to come back later and pay for the same Order, so that I do not end up with duplicates.
15. As a Student whose Payment was declined or timed out, I want a clear message and a „Zkusit znovu" that starts a fresh Payment, so that a failed attempt is not a dead end.
16. As a Student returning from GoPay, I want to see immediately whether the payment went through, so that I am not left guessing.
17. As a Student returning before GoPay has confirmed, I want the page to keep checking for a short while and then tell me where the Course will appear, so that a slow bank does not look like a failure.
18. As a Student, I want the Course opened the moment the payment is confirmed, whether I am still on the site or not, so that a closed tab does not cost me the Course.
19. As a Student, I want a „Moje kurzy" list on my Account page showing every Course I own, so that I have proof of purchase in the app.
20. As a Student who already owns a Course, I want the Sales Page to show „Přejít do kurzu" instead of a buy button, so that I cannot buy it twice by accident.
21. As a Student, I want a „Fakturační údaje" section on my Account page, so that I can correct my invoice details outside a purchase.
22. As a Student, I want my Billing Details as they were at purchase kept with the Order, so that a later change does not alter an issued invoice.
23. As an Author, I want to see Orders and their Consents in Directus, so that I can answer a Student's support question.
24. As an Author, I want a Course without a price to be unbuyable rather than free, so that a half-filled Course never gives away access.
25. As the site owner, I want the Entitlement granted only by the server after GoPay confirms the Payment, so that nobody can grant themselves a Course.
26. As the site owner, I want a repeated GoPay notification to have no second effect, so that a retry never double-grants or double-invoices.
27. As the site owner, I want the charged amount taken from the Course's current price, never from what the browser sent, so that a tampered request cannot buy cheap.
28. As the site owner, I want the Order to record the version of the terms the Student agreed to, so that a dispute can be answered.
29. As the site owner, I want the platform to work end to end against a mock gateway, so that development and verification never wait on GoPay.
30. As the site owner, I want the deployed site to be switchable between mock, GoPay sandbox and GoPay production by configuration only, so that go-live is a settings change.
31. As the site owner, I want a failed grant or an unexpected Payment state reported to Sentry, so that money taken without access is noticed within minutes.
32. As the site owner, I want the notification endpoint rate-limited and immune to forged calls, so that it cannot be used to spam GoPay's API or to fake a payment.
33. As a developer, I want a single idempotent „settle this Payment" function used by both the return route and the notification route, so that there is one place where money turns into access.
34. As a developer, I want the future contract-confirmation e-mail to have an obvious hook in the grant path, so that area 10 can add it without touching the payment logic.
35. As a developer, I want the Service Account's power limited to the three writes the flow needs, so that a leaked token cannot administer the CMS.
36. As a developer, I want the Directus changes applied and pulled into the repository in the same ticket, so that the dump and the instance never drift.

## Implementation Decisions

### Placement

- Everything lives in the `shop` layer: the Checkout page, the return page, the „Moje kurzy" and „Fakturační údaje" additions to the Account page (as components the auth layer's page includes), the Nitro routes, the GoPay client and the mock gateway. The pending-checkout cookie is read by the auth layer's login and verification pages, which is the only auth-layer change besides the Billing Details form component.
- The Sales Page's button becomes state-aware: „Koupit kurz" for a visitor or a Student without an Entitlement, „Přejít do kurzu" (to „Moje kurzy") for an owner, no button when the Course has no price. The Sales Page's Nitro route gains the caller's Entitlement for that Course, read with the caller's own session (ADR 0004).

### Checkout page (prototype verdict, variant C)

- One route `/objednavka/<slug>`, requires a published Course with a price; a draft is visible to an Author as on the Sales Page. Two-column layout: steps on the left, Course recap (cover, title, price, delivery copy) sticky on the right; single column at phone width.
- **Step 1 Účet.** For a visitor: tabs „Mám účet" (e-mail + password, same action as the login page) and „Jsem tu poprvé" (e-mail + password, same action as the registration page, with a line saying the password will be used once more after e-mail verification). For a Student: collapsed, showing the e-mail. After registration the step shows „Zkontrolujte e-mail" with the address. After verification the Student returns here with the e-mail pre-filled and a password field only, button „Pokračovat" (ADR 0005).
- **Step 2 Údaje a souhlas.** Billing Details form pre-filled from the Account: name; a collapsed „Chci doklad na firmu nebo s adresou" block with company, IČO, street, city, ZIP. All optional. One required unticked checkbox „Souhlasím s obchodními podmínkami kurzu." with a link. An informational line „Vaše údaje zpracováváme podle zásad ochrany osobních údajů." with a link, no checkbox. Locked until step 1 is done.
- **Step 3 Platba.** The recap's essentials repeated (Course, total price „včetně všech daní", „Neplátce DPH") and the button „Objednávka zavazující k platbě" (§ 1826a). Submitting saves the Billing Details to the Account, creates the Order and the Consent, creates the Payment and redirects the browser to GoPay's `gw_url`.
- Delivery copy is static in the page: access immediately after payment, no time limit, streamed video in the browser on computer, tablet and phone, no download. Seller identity from the site config. Friendly wording, no paragraph references; Czech typography per the `writing:czech-typography` skill.
- The pending-checkout cookie: set to the Course slug when a visitor opens the Checkout, 24 h, `httpOnly`, `sameSite: lax`. The login page and the verification landing use it as the redirect target when no `?redirect=` is present, then clear it. Existing `safeRedirectPath` rules apply.

### Order flow

- The Order is created by the Student's own session, as area 01 designed: `student` via the preset, `course`, `price_czk` as a snapshot, the nested Consent (`document: terms`, `document_version` = the terms' effective date, a constant in the shop layer until area 10 owns versions), and the Billing Details snapshot. `granted_at` is never sent.
- Order reuse: if the Student has an Order in `created` for this Course whose Payment GoPay still reports as `CREATED` or `PAYMENT_METHOD_CHOSEN`, the Checkout sends them to that Payment's `gw_url` instead of creating a new Order. Otherwise a new Order is created; older `created` Orders stay as they are. No cleanup job.
- Order statuses stay `created` → `paid` | `cancelled`. `cancelled` is set when GoPay reports `CANCELED` or `TIMEOUTED`. A `paid` Order is final for this area (refunds are manual in GoPay's admin; area 10 may revisit).
- A Student who already holds an Entitlement for the Course gets 409 from the Checkout route; the page never shows them the form.
- The charged amount is re-read from `course.price_czk` by the server when the Payment is created (area 01 review). The Order's snapshot is for display and the invoice.

### Service Account (ADR 0006, to be written during implementation)

- A Directus user „Shop service" with role „Služby", `app_access: false`, a static token in `NUXT_SHOP_DIRECTUS_TOKEN`. Its policy: `order` read all + update on `status, gopay_payment_id, fakturoid_invoice_id`; `entitlement` create + read; `course` read (id, slug, title, price_czk, status); `directus_users` read (id, email) for the Payment's payer contact. Nothing else. Never the admin token.
- Nitro gets a third server client next to the anonymous and the caller-bound ones, built from that token, used only by the Payment and settlement code.

### GoPay client

- A Nitro util over `$fetch` with four calls: token (OAuth2 client credentials, `payment-all`, cached in process and refreshed two minutes before its 30-minute expiry), create Payment, inquire Payment, refund (implemented for completeness, unused by the UI). No SDK: GoPay ships none for Node and the third-party packages are years stale.
- Create Payment: amount in haléře (`price_czk × 100`), `currency: CZK`, `order_number` = the Order id, `order_description` = the Course title, one `items` entry, `lang: CS`, `payer.contact.email` = the Student's e-mail, `callback.return_url` and `callback.notification_url` built with the auth layer's absolute-URL helper (site config, not the Host header). The Payment id is stamped onto the Order by the Service Account; the Order's `gopay_payment_id` is unique, which is the idempotency key.
- Environment: `NUXT_GOPAY_ENV=mock|sandbox|production`, `NUXT_GOPAY_GOID`, `NUXT_GOPAY_CLIENT_ID`, `NUXT_GOPAY_CLIENT_SECRET`, `NUXT_SHOP_DIRECTUS_TOKEN` (the `NUXT_` prefix is what reaches runtime config), all in the runtime config, the validated runtime-config schema and `.env.example`. `mock` is rejected when `NODE_ENV=production`. Sandbox and production differ only in base URL.

### Mock gateway

- Selected by `NUXT_GOPAY_ENV=mock`. `createPayment` returns a `gw_url` to a dev-only page that shows the amount and two buttons, „Zaplatit" and „Zrušit"; `inquire` returns the state recorded by those buttons. Clicking a button records the state, calls the site's own notification route with the Payment id, then redirects to the return URL. State lives in process memory. The page and its routes are registered only in mock mode.

### Settlement (one function, two callers)

- `settlePayment(paymentId)`: inquire GoPay; load the Order by `gopay_payment_id` with the Service Account; if the state is `PAID` and the Order is not yet `paid`: run the `onPaid` hook (empty in this area, reserved for area 10's confirmation e-mail), create the Entitlement (a `RECORD_NOT_UNIQUE` answer counts as success), set the Order `paid`; if `CANCELED` or `TIMEOUTED`: set `cancelled`; any other state: no change. Returns the resulting Order status. Every branch is idempotent by construction; the Entitlement's unique index is the last line of defence.
- **Notification route** `GET /api/gopay/notify?id=`: public, rate-limited per IP with the auth layer's limiter, no IP allow-list. Unknown Payment id: answer 200 and log. Otherwise settle and answer 200. Any thrown error is reported to Sentry and answered 500 so GoPay retries.
- **Return route** `/objednavka/<id>/navrat?id=`: requires the Student's session and that the Order is theirs; settles; renders paid („Kurz je váš", button to „Moje kurzy"), pending (auto-refresh every 3 s up to 30 s, then „Jakmile platba dorazí, kurz najdete v Moje kurzy"), or failed („Platba neproběhla", „Zkusit znovu" back to the Checkout, which creates a fresh Payment).

### Directus changes (applied by the implementer through the MCP, then pulled)

- `directus_users`: `billing_name`, `billing_company`, `billing_ic`, `billing_street`, `billing_city`, `billing_zip`, all optional strings. Student policy: new read rule on own row limited to `id, email, billing_*`; update rule widened from `password` to `password, billing_*`.
- `order`: the same six `billing_*` fields as a snapshot; Student create rule's field list widened to include them.
- The Service Account role, user, policy and permissions as above.
- `docs/directus.md` gains one sentence: edits made through the MCP count as admin-app edits and are pulled the same way.
- The dump changes travel in the ticket's commit; the probe stamp gate requires `vp run directus:probe` before that commit.

### Account page

- „Moje kurzy": the Student's Entitlements with cover and title, read through a shop-layer Nitro route with the caller's session; placeholder „Kurz se připravuje" until area 06 ships the player.
- „Fakturační údaje": the same Billing Details form component as step 2, saving to the Account.

### Epic bookkeeping

- `areas.md`: area 03 marked done with its link; 04a and 04b point at this folder; area 10 gains the § 1824a confirmation e-mail and the rewording of the withdrawal clause; a go-live line points at `../2026-09-15_gopay-go-live/`; Billing Details noted as moved into 04 from 05.

## Testing Decisions

A good test drives a public seam and asserts observable outcomes: an HTTP status, a row in Directus, a rendered state. It never asserts how the code got there.

- **Directus probes** (existing seam, `web/tests/probes/`): the Service Account can do its three writes and nothing else (no `course` update, no `directus_users` update, no `order` create); the Student still cannot write `status`, `gopay_payment_id` or any Entitlement; the Student reads and updates only their own Billing Details and not another Student's; a second Entitlement for the same Student × Course is refused. Prior art: `student-scoping.probe.ts`, `author.probe.ts`.
- **Flow tests through the mock gateway** (new seam, the only new one): start the app with `GOPAY_ENV=mock` and a fixture Student; create an Order through the Checkout route; pay through the mock; call the notification route twice; assert one Entitlement, Order `paid`, and the second call changed nothing. Then: cancel through the mock → Order `cancelled`, no Entitlement; a Student with an Entitlement gets 409; a Course without a price gets 409; a forged notification with an unknown id gets 200 and no change; the pending Order is reused while its Payment is live. Prior art: the probes' structure, run under the probe config so they are excluded from `check:all` and run by `directus:probe`.
- **Unit tests** (`web/tests/unit/`): haléře conversion, Order reuse decision, Consent list to records, pending-checkout cookie parsing, GoPay state → Order status mapping. Prior art: `price.test.ts`, `redirects.test.ts`.
- **Behaviour and appearance** with the `verify` skill: the three-step page for a visitor (both tabs), for a Student, and after verification; the return page in all three states; „Moje kurzy" and „Fakturační údaje"; the Sales Page button in its three states; desktop and 375 px.
- `vp run check:all` green before every commit; the pre-commit hook enforces it.

## Out of Scope

- Fakturoid invoicing (area 05); it reads the Order's Billing Details snapshot and the `onPaid` hook is not for it either, invoicing hangs off the `paid` transition in its own area.
- The § 1824a contract-confirmation e-mail, the lawyer's review of the terms and the withdrawal clause, document versioning (area 10). The § 1837 waiver is deliberately not asked for; the buyer keeps the 14-day withdrawal right.
- Refunds through the site; manual in GoPay's admin.
- The course player (area 06); „Moje kurzy" shows a placeholder.
- Real GoPay credentials, the deployed sandbox test scenario, production switch-over (`../2026-09-15_gopay-go-live/`).
- Passwordless or magic-link login, and the tab-waits-for-verification variant (parked in ADR 0005).
- A name field at registration; the Checkout asks for it.
- Directus Flows as an alternative home for settlement; Nitro was chosen because the secret and the outbound GoPay calls live there already.

## Open Concerns

- The terms page promises loss of the withdrawal right when consented in the order form; with no § 1837 checkbox that clause is dormant and should be reworded. Owner: site owner with the lawyer, area 10.
- GoPay sandbox credentials must be requested from GoPay by the association; until then only the mock exists. Owner: site owner.
- Whether Live Courses ever join the Catalog and when SimpleShop is switched off remains unscheduled. Owner: site owner.

All three were put to the maintainer on 2026-09-17 before the implementation run and carried deliberately: the wording is fine for now, the mock gateway is enough until go-live, and SimpleShop stays as it is because the Kurzy features are orthogonal to it.

## Further Notes

- The verification landing currently forwards to `/prihlaseni?overeno=1`; with the pending-checkout cookie it forwards to the Checkout instead, where step 1 shows the „E-mail je ověřený" notice. The login page keeps its notice for the non-checkout case.
- Registration through the app depends on `USER_REGISTER_URL_ALLOW_LIST` being set on the Directus instance; area 02 left a probe red as the gate. Run the probes first and fix the instance setting before starting the Checkout ticket if it is still red.
- The Entitlement's unique index and the consent-guard Flow's operation are not reproducible from the repository; a fresh Directus instance needs both recreated by hand (area 01 notes).
- GoPay's notification is a bare GET with only the Payment id; nothing in it is trusted. GoPay retries non-200 answers up to 20 times and times an unpaid Payment out after one hour by default.
- Directus presets never override a client-supplied value; the Student create rule's `validation` is the real guard on `student`, as area 01 documented.
