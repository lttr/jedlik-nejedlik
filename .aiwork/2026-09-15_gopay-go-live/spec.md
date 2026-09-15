---
status: not-started
blocked_by: ["../2026-09-15_checkout-gopay/spec.md"]
verified: []
references:
  - "Checkout area: ../2026-09-15_checkout-gopay/spec.md"
  - "GoPay facts: ../2026-09-15_checkout-gopay/grill-round-1.md (facts section)"
---

# GoPay go-live: sandbox on the deployed site, then production

Human and ops steps that the checkout area cannot do because they need
GoPay's cooperation and a public notification URL. Two stages with different
blockers.

## Stage 1 — sandbox on the deployed site

Blocked by: the checkout area shipped.

1. Request sandbox credentials (GoID, ClientID, ClientSecret) from GoPay for
   the association's account; they are not self-service.
2. Set `GOPAY_ENV=sandbox`, `GOPAY_GOID`, `GOPAY_CLIENT_ID`,
   `GOPAY_CLIENT_SECRET` and `DIRECTUS_SHOP_TOKEN` on the Coolify app.
3. Confirm GoPay can reach `https://www.jedlik-nejedlik.cz/api/gopay/notify`
   (Coolify passes it through, no auth wall).
4. Run GoPay's test scenario on the deployed site with the test cards: paid
   (amount ending `00`), declined (`04`), and TIMEOUTED (close the gateway
   and wait out the hour); each must arrive as a real notification and
   settle the Order. Check Sentry stays quiet.
5. Optionally ask GoPay to shorten the one-hour Payment lifetime.

## Stage 2 — production

Blocked by: stage 1; area 05 (invoice per sale); area 10 (contract
confirmation e-mail, lawyer-approved terms); the `[TEST]` fixture Course
removed or archived (area 03 open concern).

1. Production credentials from GoPay after the contract; the site's domain
   must be the registered one (GoPay checks the Referer) and TLS 1.2+.
2. Switch `GOPAY_ENV=production` and the credentials on Coolify; one real
   purchase by the owner as the smoke test, refunded in GoPay's admin.
3. Decide the SimpleShop cutover (site owner).
