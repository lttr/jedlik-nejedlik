---
status: ready
blocked_by: [02]
references:
  - "Spec: ../spec.md"
---

# 03 — Transactional collections + student scoping

**What to build:** a Student (Directus end-user) can create their own Order
with consent records and read their own rows only; a Student with an
Entitlement reads full Lesson content of that Course, one without gets an
API-level denial. Idempotency constraints downstream areas rely on are
enforced by the database.

## Acceptance criteria

- [ ] `order`, `order_consent`, `entitlement` collections exist per the
      spec's field list, in the `kurzy` folder, with Czech admin labels
- [ ] Unique constraints: `order.gopay_payment_id`, `entitlement`
      (student, course) — duplicate insert fails at API level
- [ ] Student role exists (the role area 02 assigns on registration)
- [ ] Student creates Orders only with themselves as student; reads own
      Orders/consents/Entitlements only; cannot update Order status or
      payment fields; cannot create/update/delete Entitlements
- [ ] Entitlement-gated Lesson access: full fields (`body`, `video_uid`,
      Materials incl. file download) readable only through the
      lesson → section → course → entitlement → `$CURRENT_USER` filter
- [ ] Probe fixtures: test Student with an admin-granted Entitlement and one
      without; full student probe matrix green against production
- [ ] `directus` layer Schema + zod codecs extended for the three
      collections; typecheck passes
- [ ] Schema snapshot + directus-sync dump re-pulled and committed
