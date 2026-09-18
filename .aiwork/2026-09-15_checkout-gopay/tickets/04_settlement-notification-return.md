---
status: done
blocked_by: [03]
verified: [checks, probes, behaviour]
references:
  - "Spec: ../spec.md"
  - "Data model review (idempotency): ../../2026-07-22_directus-data-model/review.md"
---

# 04 — Settlement: notification route, return page, Entitlement grant

**What to build:** money turns into access in exactly one place. `settlePayment(paymentId)` inquires GoPay, loads the Order by Payment id with the Service Account, and on `PAID` runs the `onPaid` hook (empty, reserved for area 10's confirmation e-mail), creates the Entitlement (a not-unique answer counts as done) and marks the Order `paid`; on `CANCELED`/`TIMEOUTED` marks it `cancelled`; otherwise changes nothing. Both callers use it: the public notification route and the Student's return page.

Notification route: public GET with the Payment id, per-IP rate limit, no IP allow-list, unknown id → 200 and a log line, error → Sentry and 500 so GoPay retries. Return page: requires the Student's session and their own Order; shows paid („Kurz je váš" with a button to „Moje kurzy" on the Account page), pending (auto-refresh every 3 s up to 30 s, then where the Course will appear), or failed („Platba neproběhla", „Zkusit znovu" back to the Checkout).

## Acceptance criteria

- [x] Paying in the mock gateway lands the Student on „Kurz je váš"; Directus holds the Order `paid` and one Entitlement linked to it
- [x] Calling the notification route a second (and third) time for the same Payment changes nothing: still one Entitlement, no error
- [x] Cancelling in the mock lands on „Platba neproběhla" with the Order `cancelled` and no Entitlement; „Zkusit znovu" creates a fresh Payment
- [x] A notification with an unknown id answers 200 and writes nothing; a notification for a Payment GoPay reports as `PAYMENT_METHOD_CHOSEN` writes nothing and the return page shows the pending state
- [x] A failure inside settlement reaches Sentry and answers 500 to GoPay
- [x] Flow tests under the probe config cover: paid, repeated notification, cancelled, forged id, Order reuse; run by `vp run directus:probe`
- [x] Verified with the `verify` skill in all three return states; `vp run check:all` green
