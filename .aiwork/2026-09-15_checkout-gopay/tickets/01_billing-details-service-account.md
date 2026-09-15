---
status: ready
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

- [ ] `directus_users` and `order` each have optional `billing_name`, `billing_company`, `billing_ic`, `billing_street`, `billing_city`, `billing_zip`
- [ ] Student policy: reads own row limited to id, e-mail and billing fields; updates own row limited to password and billing fields; the Order create rule accepts the billing snapshot; a probe shows another Student's row is unreadable and unwritable
- [ ] A Directus user „Shop service" (role „Služby", `app_access: false`) with a static token; its policy allows only: order read + update of `status`, `gopay_payment_id`, `fakturoid_invoice_id`; entitlement create + read; course read of id, slug, price, status; users read of id and e-mail
- [ ] Probes: the Service Account can do each of those and is refused an order create, a course update, a users update and an entitlement delete; a second Entitlement for the same Student × Course is refused
- [ ] `DIRECTUS_SHOP_TOKEN` in runtime config, the validated runtime-config schema and `.env.example`; a third server-side Directus client built from it, next to the anonymous and caller-bound ones
- [ ] `vp run directus:diff` clean, the dump diff touches only these records, probe stamp fresh, ADR 0006 written, `vp run check:all` green
