---
status: accepted
---

# Shop writes go through a Service Account; a Student only ever writes their own Order

## Context

Directus is the system of record (ADR 0001) and decides what every caller may
do, because the site authenticates against it with the caller's own session
(ADR 0002). The checkout breaks that symmetry. Three writes in the payment
flow belong to nobody who is at the keyboard. Nitro stamps the Payment id onto
an Order when the Student leaves for GoPay, moves the Order to `paid` or
`cancelled` afterwards, and creates the Entitlement that opens the Course.
GoPay's notification arrives server to server, with no session behind it,
often after the browser has gone.

A Student's session cannot make those writes without being allowed to grant
itself a Course, which is the one thing the platform must never permit.

## Decision

A dedicated Directus user, „Shop service", holds a static token that Nitro
reads from `NUXT_SHOP_DIRECTUS_TOKEN`. Its role is „Služby" and its policy has
`app_access: false`, so the account cannot sign into the admin app. The policy
allows exactly:

- `order`: read, and update of `status`, `gopay_payment_id` and
  `fakturoid_invoice_id`
- `entitlement`: create and read
- `course`: read of `id`, `slug`, `price_czk`, `status` and `title` — the
  title is the Payment's `order_description`
- `directus_users`: read of `id` and `email`, for the payer contact GoPay needs

It may not create an Order, change a Course, touch a user or delete an
Entitlement. Nitro builds a third Directus client from that token
(`getShopServiceDirectusClient`), next to the anonymous client and the
caller-bound one, and only the Payment and settlement code uses it. Everything
a Student is allowed to do stays on the Student's own session: the Order and
its Consent are created by the Student, with the Billing Details snapshot they
submitted.

## Why

- **A leaked token buys an attacker three writes, not the CMS.** The token
  lives in the server environment and in Coolify, so it is as exposed as any
  deployment secret. The blast radius is what the policy allows, which is why
  the field lists are spelled out rather than left at `*`.
- **The grant stays on the server side of the flow.** Only the settlement
  function creates an Entitlement, and it does so after re-reading the Payment
  state from GoPay. No browser request can reach that path with a payload that
  fakes a payment.
- **Directus keeps deciding.** The rules live in the policy, where the probes
  can assert them from outside, instead of in app code that grants itself
  whatever it asks for.

## Considered options

- **The admin token in the app.** One credential already exists and would work
  today. It also administers the whole CMS, including every user's password
  and every Course, so a leak from the web server would be total. Rejected.
- **Let the Student write their own Entitlement**, scoped by a filter on their
  own id. It keeps one client and no new account, and it hands anyone with a
  session the ability to grant themselves any Course by calling Directus
  directly. Rejected, because that is the risk the whole payment flow exists
  to prevent.
- **Directus Flows.** A Flow could settle the Payment inside Directus with
  admin rights and no extra token. The GoPay client secret and the outbound
  calls would then live on the instance, splitting the payment flow across two
  runtimes. Flow operations are also excluded from the committed dump because
  they embed API keys (`directus/sync.config.cjs`). Settlement would stop
  being reviewable in the repository. Rejected.

## Consequences

- A fresh Directus instance needs the role, the policy, its permissions and the
  user recreated, and a new token minted into the environment. The permissions
  travel in the dump, and the user's token never can.
- Rotating the token is an admin-app action plus a redeploy, and every Payment
  in flight keeps working, because the token is only read per request.
- Area 05 (invoicing) reads the Order's Billing Details snapshot with this same
  account, which is why `order` read is unfiltered rather than scoped.
- The probes are the standing proof: `web/tests/probes/shop-service.probe.ts`
  asserts each allowed write and each refusal.
