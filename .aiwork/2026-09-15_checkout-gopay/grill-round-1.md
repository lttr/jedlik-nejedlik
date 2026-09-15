# Grill — Area 04 (checkout + GoPay), round 1

Write your answer under each `Answer:` line (a letter, a sentence, or "recommended"). I will read this file back and compute round 2.

## Facts established (no decision needed)

- Directus already holds the model from area 01: `order` (`status`: `created` | `paid` | `cancelled`, default `created`; `price_czk`; `gopay_payment_id` unique; `fakturoid_invoice_id`), `order_consent` (`document`: `terms` | `withdrawal_1837` | `gdpr`; `document_version` string; `granted_at` preset `$NOW`), `entitlement` (unique on student × course, DDL-only index).
- Student policy: may create an Order for self (with nested consents) and read own Orders and Entitlements. Cannot write `status`, `gopay_payment_id`, or any Entitlement. Those are reserved for a Nitro service account that area 01 deferred to 04b. The app holds no service token today.
- Area 01 review: 04b must re-read `course.price_czk` for the charge, never trust `order.price_czk`.
- Nobody collects a name or address anywhere. Registration is email + password; `directus_users` has only stock fields; the session carries only the email.
- GoPay: OAuth2 client-credentials token (30 min), `POST /payments/payment` with amount in haléře, `return_url` + `notification_url` (max 512 chars each), response has `gw_url`. Notification is a bare `GET ?id=<paymentId>` with no signature; the app must call `GET /payments/payment/{id}` to learn the state. Same on return. Notifications fire for every state change except CREATED → PAYMENT_METHOD_CHOSEN, and retry up to 20× until we answer 200. Unpaid payments time out after 1 h by default. Test cards: amount ending `00` pays, `04` declines.
- No official Node SDK; third-party npm packages are 2018–2023 stale. Plan: raw `fetch` in a Nitro util (token, create, inquiry, refund).
- Sandbox credentials (GoID, ClientID, ClientSecret) are issued by GoPay on request, not self-service. This is the first blocker on the path.
- Nitro session middleware skips `/api/**`; `authPageUrl(event, path)` builds absolute URLs from site config (use for callback URLs); `requireAccountDirectusClient(event)` gives `{ account, client }` or 401.

## Questions

**Q1 - One spec or two?**
`areas.md` splits 04a (Order + consent + redirect) and 04b (notification + grant). Neither is useful alone.
(A) one task folder covering both, tickets split along the 04a/04b seam
(B) two folders as the index says
Recommended: A.
Answer: it depends on the dependency graph of tasks. I am fine with both
variants, decide based on the dependency graph.

**Q2 - Email verification at checkout**
Area 02 ships mandatory verification before login (an unverified user cannot log in at all).
(A) keep it; unverified Student cannot reach checkout; the verification link returns them to `/objednavka/<slug>`
(B) allow checkout unverified
(C) drop mandatory verification entirely
Recommended: A. Since an unverified user has no session, A is in effect already true; the only new work is the return-to-checkout redirect after verifying.
Answer: follow recent decisions and implementation, which was about verification
but guided by the process so user can go through checkout and register during
that.

**Q3 - Checkout page shape**
What `/objednavka/<slug>` shows before redirecting to GoPay.
(A) one screen: Course title, price, payer fields (per Q4), consent checkboxes, one button „Zaplatit"
(B) multi-step
Recommended: A.
Answer: ok

**Q4 - Payer data collected**
Nothing exists today. Fakturoid (area 05) needs at least a contact name.
(A) nothing beyond the Account email
(B) full name on the checkout form, stored on the Order (new `order` fields, Student create permission widened), optional collapsed company + IČO field
(C) full postal address
Recommended: B. Address stays out until someone asks.
Answer: consider incorporating the name and address and other info into the
account so that the user does not have to enter it again next time.

**Q5 - Consent checkboxes v1**
`order_consent.document` already enumerates `terms`, `withdrawal_1837`, `gdpr`. Lawyer input pending (area 10).
(A) two separate unchecked checkboxes: terms, and the §1837 explicit consent to immediate delivery / loss of withdrawal right; `gdpr` shown as an informational line with a link, no checkbox and no record
(B) three checkboxes incl. GDPR, three records
(C) one combined checkbox
Recommended: A, implemented as a static list in code (key, label, version, link) so the lawyer's answer changes list entries, not the flow. A GDPR record without a checkbox would be meaningless; GDPR notice is information, not consent.
Answer: research what is standard to do in the Czech Republic and follow that. I
would go with the simplest option possible.

**Q6 - Where document versions live now**
(A) a version constant per document in the shop layer (e.g. `terms: "2026-09"`), replaced by area 10's mechanism later
(B) a `legal_document` collection in Directus now
Recommended: A.
Answer: ok

**Q7 - Buying a Course you already own**
(A) Sales Page button becomes „Přejít do kurzu"; checkout route refuses server-side when an Entitlement exists
(B) allow buying twice
Recommended: A. Lifts area 03's "no entitlement check" rule, which was scoped to 03 only.
Answer: ok

**Q8 - Unpaid Order lifecycle**
Student clicks „Zaplatit", Order is `created`, GoPay payment created, they abandon.
(A) on next attempt, reuse the existing `created` Order for that Student × Course if its GoPay payment is still live (CREATED / PAYMENT_METHOD_CHOSEN), else create a new Order
(B) always create a new Order; old ones stay `created` forever
(C) reuse the Order and create a fresh GoPay payment on it (overwrite `gopay_payment_id`)
Recommended: A. `cancelled` is set when GoPay reports CANCELED / TIMEOUTED. No cleanup job.
Answer: ok but is it ok to not cleanup?

**Q9 - Return page**
After GoPay redirects the browser back, the notification may not have arrived yet. GoPay itself says to inquire the state on return.
(A) return page polls a Nitro route until the Order is `paid` or a timeout, showing "checking payment…" then a result
(B) the return route itself inquires GoPay and, if PAID, runs the same idempotent grant function the notification uses; UI from A as fallback while pending
Recommended: B. TO-5 wording "notification is the trigger" becomes "notification is authoritative; return route may call the same function early". Say if you want the pure reading (A).
Answer: choose what is better for UX and better for robustness at the same time.

**Q10 - Who writes Orders and Entitlements**
Area 01 designed the split: Student session creates Order + consents; a service account stamps `gopay_payment_id`, `status`, and creates the Entitlement.
(A) all writes through the service token (ignore Student create permission)
(B) follow area 01: Order + consents via the Student's session, payment id / status / Entitlement via the service token
Recommended: B. Either way the service account arrives here → ADR candidate (service account vs Directus Flows, hard to reverse).
Answer: explain me the issue first.

**Q11 - Sandbox, secrets, and which GoPay the deployed site talks to**
(A) env vars `GOPAY_GOID`, `GOPAY_CLIENT_ID`, `GOPAY_CLIENT_SECRET`, `GOPAY_ENV=sandbox|production`, added to runtimeConfig + `runtime-config.schema.ts` + `.env.example`; probes hit sandbox with real credentials, unit tests mock the HTTP client
(B) additionally: the deployed site uses sandbox until the client says go
Recommended: A and B.
Also: do you already have sandbox credentials, or should the spec carry a "request sandbox access from GoPay" human step?
Answer: i am not sure yet, might have to be mocked until i have the info, could
be done in followup tickets.

**Q12 - Directus config change process for this area**
This area adds `order` fields (Q4), a service policy + token, and widened Student create permission. Config is pull-only.
(A) the spec lists the exact admin-app changes as a checklist; implementer stops at that ticket until you confirm they are applied
(B) implementer applies schema/permission changes via the Directus MCP tools, then `directus:pull`
Recommended: B if the MCP token can write fields/permissions (I will verify), else A.
Answer: verify it, otherwise tell me more about the choice.

**Q13 - Deployed notification URL during development**
GoPay must reach `notification_url` over the public internet. The dev server is not reachable.
(A) verify end-to-end only on the deployed site (sandbox GoPay) after each push; locally, drive the grant function directly in probes
(B) a tunnel (e.g. cloudflared) from dev to expose the notification route
Recommended: A. The grant path is testable without GoPay calling in: the probe creates a sandbox payment, pays it with a test card via Playwright, then calls the notification route locally with the payment id.
Answer: again for this task to be done i am ok with mocks. specify followup
tasks that need real services and tokens and manual work and testing.
