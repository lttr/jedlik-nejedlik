---
status: ready
blocked_by: []
references:
  - "Spec: ../spec.md"
  - "GoPay facts: ../grill-round-1.md (facts section)"
---

# 02 — GoPay client and the mock gateway

**What to build:** a Nitro-side GoPay client the rest of the area calls without knowing which GoPay it talks to, and a mock gateway so a developer can walk the whole payment in dev without credentials. Selected by `GOPAY_ENV=mock|sandbox|production`.

The real client: OAuth2 client-credentials token (`payment-all`, cached in process, refreshed two minutes before its 30-minute expiry), create Payment (amount in haléře, CZK, `lang: CS`, order number, description, one item, payer e-mail, return and notification URLs built from site config), inquire Payment, refund. Sandbox and production differ only in base URL. No SDK.

The mock: `createPayment` returns a `gw_url` to a dev-only page showing the amount with „Zaplatit" and „Zrušit"; a click records the state in memory, calls the site's notification URL with the Payment id, then redirects to the return URL. `inquire` returns the recorded state. Page and routes exist only in mock mode; the schema rejects `mock` when `NODE_ENV=production`.

## Acceptance criteria

- [ ] `GOPAY_ENV`, `GOPAY_GOID`, `GOPAY_CLIENT_ID`, `GOPAY_CLIENT_SECRET` in runtime config, the validated schema and `.env.example`; `mock` refused under `NODE_ENV=production`
- [ ] One client interface with two implementations; the real one issues the four calls with the documented headers, bodies and URLs (unit-tested against a stubbed `$fetch`)
- [ ] Amount conversion and GoPay state → Order status mapping are pure functions with unit tests
- [ ] In dev with `GOPAY_ENV=mock`, opening the mock page for a created Payment and clicking „Zaplatit" records `PAID`, calls the notification URL, and redirects to the return URL; „Zrušit" does the same with `CANCELED`
- [ ] Mock page and routes are absent from a production build
- [ ] `vp run check:all` green
