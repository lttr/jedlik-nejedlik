---
status: in-progress
blocked_by: []
references:
  - "Spec: ../spec.md"
  - "Data model: ../../2026-07-22_directus-data-model/spec.md"
  - "Directus workflow: ../../../docs/directus.md"
  - "ADR 0001: ../../../docs/adr/0001-directus-system-of-record.md"
---

# 01 — Billing Details on the Account and the Service Account in Directus

**What to build:** a Student can keep optional Billing Details (name, company, IČO, street, city, ZIP) on their Account and read them back, an Order can carry a snapshot of the same six fields, and Nitro has a Service Account whose token lets it do exactly the three writes the payment flow needs: stamp a Payment id and status on an Order, and create an Entitlement. Nothing user-visible yet; the proof is the probes.

Apply the Directus changes through the MCP (admin token), then `vp run directus:pull` and commit the dump with the code. Add one sentence to the Directus docs saying MCP edits count as admin-app edits. Write ADR 0006 „Shop writes through a Service Account; Students write only their own Orders" (considered: admin token in the app, Student-only writes, Directus Flows).

## Acceptance criteria

- [x] `directus_users` and `order` each have optional `billing_name`, `billing_company`, `billing_ic`, `billing_street`, `billing_city`, `billing_zip`
- [ ] Student policy: reads own row limited to id, e-mail and billing fields; updates own row limited to password and billing fields; the Order create rule accepts the billing snapshot; a probe shows another Student's row is unreadable and unwritable
- [ ] A Directus user „Shop service" (role „Služby", `app_access: false`) with a static token; its policy allows only: order read + update of `status`, `gopay_payment_id`, `fakturoid_invoice_id`; entitlement create + read; course read of id, slug, price, status; users read of id and e-mail
- [ ] Probes: the Service Account can do each of those and is refused an order create, a course update, a users update and an entitlement delete; a second Entitlement for the same Student × Course is refused
- [x] `DIRECTUS_SHOP_TOKEN` in runtime config, the validated runtime-config schema and `.env.example`; a third server-side Directus client built from it, next to the anonymous and caller-bound ones
- [ ] `vp run directus:diff` clean, the dump diff touches only these records, probe stamp fresh, ADR 0006 written, `vp run check:all` green

## Left to apply on the instance

The permission system refused the remaining writes to the live Directus, so
three pieces of the ticket are unapplied and the criteria above stay unticked:

- the Student policy's `read` rule on `directus_users` (own row, limited to
  `id`, `email` and the six `billing_*` fields). Without it a Student cannot
  read their Billing Details back, and even a permitted `PATCH /users/me`
  answers 403, because Directus reads the updated row back through the read
  rules. `web/tests/probes/billing-details.probe.ts` carries a note where the
  two missing assertions belong (own-row write, own-row read).
- the role „Služby", its policy and its permissions, and the „Shop service"
  user with a static token. `web/tests/probes/shop-service.probe.ts` holds the
  whole matrix and skips itself until `DIRECTUS_PROBE_SHOP_TOKEN` is set.
- `NUXT_SHOP_DIRECTUS_TOKEN` in `web/.env`. The runtime-config schema requires
  it, so the dev server refuses to boot until the Service Account exists and
  its token is minted.

What was applied is in the committed dump: the twelve `billing_*` fields, the
widened Student `order` create rule and the widened Student `directus_users`
update rule. `vp run directus:diff` is clean.
