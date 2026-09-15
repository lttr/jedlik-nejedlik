---
status: done
rounds: [grill-round-1.md, grill-round-2.md, grill-round-3.md]
references:
  - "Epic: ../2026-06-09_kurzy-platforma/areas.md (areas 04a, 04b)"
  - "Data model: ../2026-07-22_directus-data-model/spec.md"
  - "Auth: ../2026-08-19_auth-customers/spec.md"
  - "Catalog: ../2026-09-14_catalog-sales-pages/spec.md"
---

# Grilling — Area 04: Checkout + GoPay (decisions)

Settled 2026-09-15 over three rounds; the question files hold the reasoning and the facts found. This is the decision list `to-spec` builds from.

## Scope

- One task folder for 04a + 04b (ticket graph is linear). Area 05 (Fakturoid) and area 10 (legal documents) stay separate.
- **Prototype verdict (2026-09-15, `prototype/index.html`): variant C.** The checkout is a stepper: 1 Účet (login or register inline, tabs „Mám účet / Jsem tu poprvé") → 2 Údaje a souhlas → 3 Platba, with the Course recap as a sticky aside. After e-mail verification the Student returns to step 1 with the e-mail pre-filled and types only the password („Pokračovat"). Why the password is asked again, and what was parked, is ADR 0005.
- Go-live steps that need GoPay credentials and a public notification URL become their own folder `gopay-go-live` (two stages: sandbox on the deployed site — depends on this area only; production — also depends on 05, 10 and the `[TEST]` fixture cleanup).
- `areas.md`: mark 03 done with its link, point 04a/04b here, add the § 1824a confirmation e-mail to area 10, add the go-live folder, note Billing Details moved into 04.

## Flow

- Checkout is one page `/objednavka/<slug>`: Course recap, Billing Details form, one terms checkbox, final button „Objednávka zavazující k platbě" (§ 1826a). Sales Page keeps „Koupit kurz".
- Guest: step 1 of the stepper (verdict above). Pending checkout survives register → verify → login via a short-lived cookie (`pending-checkout=<slug>`, 24 h) consumed by the login page when no `?redirect=` is present. Registration stays e-mail + password; the name is asked at checkout.
- E-mail verification stays mandatory as area 02 shipped it (an unverified user has no session anyway).
- Owned Course: Sales Page button becomes „Přejít do kurzu", checkout route refuses (409). Unpriced Course: no button, 409.
- Recap copy is static: immediate access after payment, no time limit, streamed video in the browser, seller identity from site config. Friendly wording, no legalese.
- Return page `/objednavka/<id>/navrat`: the route inquires GoPay and runs the same idempotent grant as the notification route; states paid / pending (auto-refresh, then "you'll find it in Moje kurzy") / failed („Zkusit znovu").
- `/muj-ucet` gains „Moje kurzy" (Entitlements, placeholder „Kurz se připravuje" until area 06) and „Fakturační údaje".

## Consents (v1)

- **One checkbox**: „Souhlasím s obchodními podmínkami kurzu." → one `order_consent` row, `document: terms`, `document_version` = the terms' effective date („28. 1. 2026" today, constant in the shop layer until area 10).
- **No § 1837 waiver.** Owner's decision: the buyer keeps the 14-day withdrawal right and may ask for a refund. Consequences to record in the spec and hand to area 10: the terms clause that promises loss of the right when consented in the order form (`obchodni-podminky.vue:371-377`) is dormant and should be reworded; refunds are handled manually (GoPay refund endpoint exists, a manual step in the GoPay admin is enough for v1); `withdrawal_1837` in the enum stays unused.
- Privacy policy: informational line with a link, no checkbox, no record (ÚOOÚ). `gdpr` in the enum is never written.
- § 1824a confirmation e-mail (contract confirmation with terms attached, before access) is **not** in this area. The grant path exposes a hook (`onPaid`) where area 10 slots the send.

## Data and permissions

- Order lifecycle: `created` → `paid` | `cancelled`; `cancelled` set by GoPay's CANCELED/TIMEOUTED notification. No cleanup job. A new attempt reuses a `created` Order whose Payment is still live, else creates a new Order.
- Writes: Student session creates the Order (+ nested consent) as area 01 designed; a **Service Account** (Directus user „Shop service", role „Služby", `app_access: false`, static token `DIRECTUS_SHOP_TOKEN`) stamps `gopay_payment_id`, sets `status`, creates the Entitlement. Its policy: order read + update on `status, gopay_payment_id, fakturoid_invoice_id`; entitlement create/read; course read. Never the admin token.
- The charge amount is re-read from `course.price_czk` (area 01 review), never from the Order.
- Billing Details: optional fields `billing_name, billing_company, billing_ic, billing_street, billing_city, billing_zip` on `directus_users` (Student: read own row `id, email, billing_*`; update own `password, billing_*`) and snapshotted onto `order` at purchase. Country fixed CZ.
- Directus changes are applied by the implementer through the MCP (admin token), then `vp run directus:pull`; the diff is reviewed in the commit. `docs/directus.md` gets one line saying MCP edits count as admin-app edits.
- ADR 0006 during implementation: "Shop writes through a Service Account; Students write only their own Orders" (0005 is the verification ADR, already written).

## GoPay

- Raw `fetch` client in a Nitro util: OAuth2 client-credentials token (30 min, cached), create payment (amount in haléře, `lang: CS`, `return_url` + `notification_url` via `authPageUrl`), inquiry, refund. No SDK.
- Env: `GOPAY_ENV=mock|sandbox|production`, `GOPAY_GOID`, `GOPAY_CLIENT_ID`, `GOPAY_CLIENT_SECRET`, `DIRECTUS_SHOP_TOKEN` — runtimeConfig + `runtime-config.schema.ts` + `.env.example`. `mock` rejected when `NODE_ENV=production`.
- **Mock gateway** for dev and the `verify` skill: `createPayment` returns a `gw_url` to a dev-only page with „Zaplatit" / „Zrušit"; clicking records the state, calls our notification route, redirects to the return URL.
- Notification route: public, per-IP rate limit (existing `enforceRateLimit`), no IP allow-list, re-reads state from GoPay before acting, answers 200 for unknown ids (logged).
- Probes: grant idempotency (repeat notification, no double Entitlement), Student cannot write status/payment id, Service Account cannot do more than its policy, Billing Details read/update scoping.

## Open for area 10 / go-live (not this area)

- Lawyer review of the terms clause on withdrawal, the recap copy, and whether to introduce the § 1837 waiver later.
- § 1824a confirmation e-mail.
- GoPay sandbox and production credentials; GoPay test scenario on the deployed site; Referer/TLS requirements.
