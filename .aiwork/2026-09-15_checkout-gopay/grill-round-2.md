# Grill — Area 04 (checkout + GoPay), round 2

Round 1 settled: one task folder (this one); one-screen checkout; version constants in code; owned Course → „Přejít do kurzu" + server refusal; abandoned Orders stay `created`, GoPay's TIMEOUTED/CANCELED notification flips them to `cancelled`, no cleanup job; return route inquires GoPay and runs the same idempotent grant as the notification route; Student session writes Order + consents, a service account writes payment id, status and Entitlement.

## New facts since round 1

**Registration does not survive the checkout hop.** `?redirect=` works on `/prihlaseni` and in the `auth` middleware, but `/registrace` ignores it, the verification e-mail carries no redirect, and `/overeni-emailu` always lands on `/prihlaseni?overeno=1`. "Register during checkout" therefore needs a new carrier (Q14).

**Registration may still be blocked on the instance.** Area 02 left a red probe as a gate: `USER_REGISTER_URL_ALLOW_LIST` must be set on Directus or every registration answers 502. Area 02's notes later list it among env vars you set by hand, but the probe is the evidence. `vp run directus:probe` will tell.

**Student cannot read `directus_users` at all** (deliberate, ADR 0002). Billing data on the Account means a new filtered read rule (own row, listed fields) and widening the update rule from `password` to the billing fields.

**MCP token is admin** (policy „MCP", `admin_access: true`). It can create fields, policies and permissions. `docs/directus.md` describes the workflow as admin-app-then-pull; nothing technical prevents MCP-then-pull.

**Czech consumer law for paid digital content (verified against the consolidated Civil Code, ČOI, ÚOOÚ):**

- § 1837 písm. l): the 14-day withdrawal right is lost only if all three hold: (1) prior _express_ consent to start before the period ends, (2) the consumer was told that consent extinguishes the right, (3) the trader sent a confirmation per § 1824a. Miss any one and § 1836 b) applies: the consumer may withdraw and pays nothing, even after watching the whole course. No pro-rata rule for digital content. Burden of proof is ours (§ 1839).
- § 1824a: confirmation of the concluded contract in text form, containing the § 1820 data and the sentence that the consumer consented to early performance and acknowledged losing the right. It must be sent **before** performance starts, i.e. before or together with the Entitlement. A link to the terms is not enough; the terms must be in the body or attached. An invoice e-mail does not satisfy this.
- § 1826a odst. 2: the final button must say „Objednávka zavazující k platbě" or an equally unambiguous phrase, else the contract is voidable by the consumer. „Koupit kurz" alone on the final step is not enough.
- § 1826a odst. 1 + § 1820: the order recap must show name, total price incl. taxes, delivery method (immediate online access), access duration, technical requirements (streaming, browser, mobile), seller identity, withdrawal info incl. the model form, ADR body (ČOI).
- § 1817: a pre-ticked box is not express consent. Never pre-tick.
- Terms checkbox: not legally required; a visible "by ordering you agree" sentence is defensible, a checkbox is the safe convention.
- GDPR: ÚOOÚ says consent **must not** be requested for order data (Art. 6(1)(b)). Informational link only. So the `gdpr` value of `order_consent.document` should never be written.
- Invoice from a non-VAT-payer: buyer name and address are not required (zákon o účetnictví § 11, ZOS § 16). E-mail suffices for B2C. Never print a DPH amount; „Neplátce DPH" advisable.
- The current terms page (`obchodni-podminky.vue:371-377`) already promises: „pokud Spotřebitel v objednávkovém formuláři odsouhlasí zpřístupnění online kurzu hned po zaplacení, nemůže ve 14denní lhůtě odstoupit". Effective date „28. 1. 2026". Privacy policy „platí od 1. 1. 2024". Those dates are the natural `document_version` strings.

## Questions

**Q14 - Carrying the pending checkout across register → verify → login**
(A) a short-lived cookie `pending-checkout=<slug>` set when a guest opens `/objednavka/<slug>`; login page (and the `overeno=1` landing) consumes it as the redirect target when no `?redirect=` is present; TTL 24 h
(B) append `?redirect=` to the verification URL in the e-mail (risky: `USER_REGISTER_URL_ALLOW_LIST` is an exact-URL match, query params may fail)
(C) `/registrace` accepts `?redirect=`, stores it in localStorage, `/overeni-emailu` reads it back
Recommended: A. Works across tabs and a mail client opening a new window; no Directus setting involved; auth layer change is small (login page falls back to the cookie).
Answer: ok if no completely different easier solution exists

**Q15 - Guest arriving at checkout**
(A) redirect to `/prihlaseni?redirect=/objednavka/<slug>` (existing `auth` middleware), the login page already links to registration
(B) checkout page renders for guests with an inline "log in or register" panel
Recommended: A. Zero new UI; Q14 carries the target.
Answer: the inline variant might be a good idea, we need to /prototype both variants

**Q16 - Billing details on the Account (your Q4 answer)**
Legally nothing beyond e-mail is needed. Fakturoid accepts a contact with just a name + e-mail. Proposal:

- New optional `directus_users` fields: `billing_name`, `billing_company`, `billing_ic`, `billing_street`, `billing_city`, `billing_zip`. Country fixed CZ.
- Student policy: read own row (`id, email, billing_*`), update own row (`password, billing_*`).
- Checkout form pre-fills from the Account, saves back on submit. The Order snapshots the values (`billing_*` fields on `order`) so the invoice is stable if the Account changes later.
- `/muj-ucet` gets a „Fakturační údaje" section using the same form component.
  (A) all of the above, all fields optional, form shows name + a collapsed „Chci fakturu na firmu / s adresou" block
  (B) name only (`billing_name`), everything else later
  (C) do not touch the Account; billing fields only on the Order (re-typed each purchase)
  Recommended: A. Cost is one form component and two permission rules; the snapshot on Order is what area 05 reads.
  Answer: ok

**Q17 - Consent checkboxes, final shape (your Q5 answer + research)**
(A) one required unticked checkbox: § 1837 consent, wording:
„Souhlasím se zpřístupněním kurzu ihned po zaplacení, tedy se započetím plnění před uplynutím lhůty pro odstoupení od smlouvy. Beru na vědomí, že tím podle § 1837 písm. l) občanského zákoníku zaniká mé právo odstoupit od smlouvy do 14 dnů."
Terms: a sentence above the button „Odesláním objednávky souhlasíte s obchodními podmínkami" with a link; still recorded as an `order_consent` row (`terms`, version = effective date) because it is the version the buyer bought under. Privacy policy: link only, no record.
(B) two checkboxes (terms + § 1837), both recorded; privacy link only
Recommended: A. Simplest legally sound shape; the § 1837 box is the only one the law wants as an express act. Lawyer (area 10) may still ask for B; switching is one list entry.
Answer: can we be more generic like "I agree to the terms and conditions of the course" and "I agree to the privacy policy of the course"? mentionig the paragraph and laws is frightening to the user

**Q18 - Button wording**
Sales Page keeps „Koupit kurz" (it leads to the checkout, not to payment). Checkout final button:
(A) „Objednávka zavazující k platbě" (ČOI's recommended literal)
(B) „Zaplatit <price>" (ČOI accepts „Zaplaťte nyní"-style wording)
Recommended: A. The one phrase ČOI explicitly recommends; the invalidity sanction is not worth a nicer verb.
Answer: ok

**Q19 - Confirmation e-mail (§ 1824a) — new scope**
The law requires a text-form confirmation with the § 1837 sentence, the § 1820 data and the terms attached, sent before access is granted. Nothing in areas 04–05 planned this; the Fakturoid invoice e-mail (area 05) does not qualify.
(A) in this area: Nitro sends the e-mail via Mailgun (new env vars `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, same account Directus uses) right before the grant, with the terms page rendered to PDF or included as text; grant proceeds even if the send fails, failure logged to Sentry and marked on the Order (`confirmation_sent_at` null)
(B) in this area: a Directus Flow on `order` update (status → `paid`) sends it with Directus's mailer (Mailgun already wired); operations are not in the dump, so it is hand-configured and documented; attachment support to be verified
(C) defer to area 10 (legal docs) and launch-gate it: no confirmation e-mail until then, the site stays on sandbox GoPay anyway
Recommended: C for this task, with A specced as the follow-up ticket inside area 10 or a new area. Reason: the e-mail body is legal copy the lawyer has to approve, the terms need a versioned attachable form, and this area is already the biggest on the path. The grant path gets a hook (`onPaid`) where the send slots in.
Answer: create follow-up or add note to future area

**Q20 - Order recap content (§ 1826a odst. 1)**
The recap needs delivery method, access duration and technical requirements. None exist as Course data.
(A) static copy in the checkout page: „Přístup ihned po zaplacení, bez časového omezení, streamované video v prohlížeči (počítač, tablet, telefon), bez stahování", seller identity block from the site config
(B) new Course fields for access duration / requirements
Recommended: A. One product type, one answer; a Course field can come when a Course differs.
Answer: ok but the wording should be better, friently and not legalese

**Q21 - Directus changes: who applies them (your Q12 answer)**
MCP is admin, so (B) is possible. The trade-off: `docs/directus.md` frames the admin app as the place humans edit and the dump as the review artefact. An agent writing schema via MCP keeps that property (the pull is still the review) but the agent, not you, is clicking. Changes in this area: `order.billing_*` fields, `directus_users.billing_*` fields, Student read/update rules on users, a „Shop service" policy + role + user + static token, its permissions (order read/update on `status, gopay_payment_id, fakturoid_invoice_id`; entitlement create/read; course read).
(A) you apply them from a checklist in the ticket, implementer waits
(B) implementer applies via MCP, pulls, and the diff is reviewed in the commit; `docs/directus.md` gains one line saying MCP edits are admin-app edits
Recommended: B.
Answer: ok

**Q22 - Service account credential**
(A) a Directus user „Shop service" with a static token in env `DIRECTUS_SHOP_TOKEN`, role „Služby", policy with the minimal rules above; no login, `app_access: false`
(B) reuse the admin/MCP token in the app
Recommended: A. B would let a leaked app secret administer Directus.
Answer: explain me why it is needed, ok with A after explanation

**Q23 - Mock gateway for development (your Q11/Q13 answers)**
Real GoPay needs sandbox credentials (not yet available) and a public notification URL (never available in dev). Proposal: the GoPay client is an interface with two implementations selected by `GOPAY_ENV=mock|sandbox|production`. `mock` is an in-process fake: `createPayment` returns a `gw_url` pointing at a dev-only page `/dev/gopay/<id>` with buttons „Zaplatit" / „Zrušit"; clicking one records the state and calls our own notification route, then redirects to the return URL. Absent from production builds (route registered only when `GOPAY_ENV=mock`; the schema rejects `mock` when `NODE_ENV=production`).
(A) yes, build the mock in this area so the whole flow is verifiable locally and by the `verify` skill
(B) no mock; unit-test the client with fetch stubs, verify the flow only once sandbox exists
Recommended: A. It is what makes the area finishable without GoPay's cooperation, and it stays useful for every later verification run.
Answer: ok

**Q24 - Follow-ups needing real services (your Q13 answer)**
To be filed as a separate task folder, not tickets here:

1. request sandbox GoID / ClientID / ClientSecret from GoPay; set env on Coolify (`GOPAY_ENV=sandbox`)
2. set the notification URL expectation: GoPay calls `https://www.jedlik-nejedlik.cz/api/gopay/notify?id=…`; confirm Coolify passes it through
3. run the GoPay test scenario (paid, CANCELED, TIMEOUTED with a real notification) on the deployed sandbox site
4. production credentials + `GOPAY_ENV=production` at launch; GoPay requires the site's registered domain in the Referer and TLS 1.2+
5. optional: ask GoPay to shorten the 1 h payment lifetime
   (A) file it as `.aiwork/<date>_gopay-go-live/spec.md` now, status not-started
   (B) keep it as a section in this spec
   Recommended: A.
   Answer: ok but i need clarification how it depend on areas beyond 04a

**Q25 - Where „Přejít do kurzu" leads**
Area 06 (player) does not exist. After payment, and on the Sales Page of an owned Course:
(A) `/muj-ucet` gains a „Moje kurzy" list of Entitlements (title, cover, „Kurz se připravuje" placeholder); the button links there
(B) link to the Sales Page itself with an „Máte zakoupeno" banner
Recommended: A. It also gives the Student proof of purchase in the app, which the return page can point to.
Answer: ok

**Q26 - Course without a price**
`course.price_czk` is optional in the codec. A priced-less published Course:
(A) Sales Page hides the button; checkout route answers 409
(B) treat as free: grant on click
Recommended: A. Free courses are a product decision nobody has made.
Answer: ok

**Q27 - Notification endpoint hardening**
GoPay signs nothing; it publishes sender IPs. The route re-reads state from GoPay before acting, so a forged call can at most make us do a lookup.
(A) no IP filter; per-IP rate limit via the existing `enforceRateLimit`; unknown payment id → 200 (so GoPay stops retrying) with a log line
(B) IP allow-list from the docs
Recommended: A. IP lists rot; the state re-read is the real guard.
Answer: ok but explain why
