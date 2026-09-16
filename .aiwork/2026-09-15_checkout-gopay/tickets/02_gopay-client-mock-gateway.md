---
status: done
verified: [checks, behaviour]
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

- [x] `GOPAY_ENV`, `GOPAY_GOID`, `GOPAY_CLIENT_ID`, `GOPAY_CLIENT_SECRET` in runtime config, the validated schema and `.env.example`; `mock` refused under `NODE_ENV=production`
- [x] One client interface with two implementations; the real one issues the four calls with the documented headers, bodies and URLs (unit-tested against a stubbed `$fetch`)
- [x] Amount conversion and GoPay state → Order status mapping are pure functions with unit tests
- [x] In dev with `GOPAY_ENV=mock`, opening the mock page for a created Payment and clicking „Zaplatit" records `PAID`, calls the notification URL, and redirects to the return URL; „Zrušit" does the same with `CANCELED`
- [x] Mock page and routes are absent from a production build
- [x] `vp run check:all` green

## Verification

Nuxt reads env overrides with the `NUXT_` prefix, so the four variables are
`NUXT_GOPAY_ENV`, `NUXT_GOPAY_GOID`, `NUXT_GOPAY_CLIENT_ID` and
`NUXT_GOPAY_CLIENT_SECRET` (as `NUXT_SESSION_PASSWORD` already is).

- **Checks** — `vp run check:all` green; 24 new unit tests (`tests/unit/gopay.test.ts`,
  `tests/unit/gopay-api-client.test.ts`).
- **Behaviour, dev app** (`NUXT_GOPAY_ENV=mock`): a Payment created through
  `getGopayClient(event)` answers a `gw_url` on this server; the gateway page
  renders the Course, amount and both buttons; „Zaplatit" records `PAID`,
  „Zrušit" records `CANCELED`, each calls `/api/gopay/notify?id=<id>` on the
  request's own origin (404 today — the route is ticket 04's, and the dev log
  shows the attempt) and redirects to the return URL. Screenshots:
  `../screenshots/02-mock-gateway-desktop.png`, `../screenshots/02-mock-gateway-375.png`.
- **Behaviour, built site** (`nuxi build` with `NUXT_GOPAY_ENV=sandbox`): the
  output contains no `platba-mock` page and no `/api/gopay/mock/**` route, both
  answer 404 on the running server, and boot refuses `NUXT_GOPAY_ENV=mock`
  („refused in production"), an unknown env value, and missing credentials.
