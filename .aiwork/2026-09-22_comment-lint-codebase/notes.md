# Notes — comment lint pass

Findings left standing per ticket, with the reason. Never a `lint-comments: keep`
marker. Tickets 01–10 were worked in parallel by one agent each (workflow
`wf_4bd350ff-63e`) after ticket 00 landed as `1e0f8e4`.

## Ticket 01 — root + web configs, web/server, web/shared

Fixed 16, left standing 6.

- `web/server/runtime-config.schema.ts:57-59` — rewrite — leans on an undefined term or reference: Shop Service Account, Payment, Order and Entitlement are all GLOSSARY.md headwords used in their glossary sense; ticket 00 made the finding false.
- `web/shared/utils/ignored-hostnames.ts:1-9` — shorten — 66 words: Over 60, but no restatement: every clause is a why (the two call sites that must not drift, and why 127.0.0.1 is listed since a local production build is not import.meta.dev).
- `web/nuxt.config.ts:14-21` — shorten — 83 words: A deliberate prose header carrying the consent guarantee: why there is no `trigger`, and why `bundle`/`proxy` are off (plus Clarity's broken bundling). Nothing to cut without deleting a reason.
- `web/nuxt.config.ts:98-99` — remove — answers a question the reader would not ask (70%) / it is a reason, not a description (99%): Weighed on the co-reason alone per the spec: a reader does ask why three cookie defaults are spelled out, and the answer (the ADR 0002 guarantee) is the point.
- `web/nuxt.config.ts:118-121` — shorten — 43 words: Under the spec's 60-word threshold.
- `web/env.d.ts:1-4` — shorten — 41 words: Under the spec's 60-word threshold.

## Ticket 02 — web/app

Fixed 21, left standing 18.

Hook regrade at commit: four rewritten comments came back `shorten` at 68–93 words (`cookie-consent.ts:29-36`, `meta-pixel.client.ts:25-33`, `:47-60`, `:71-76`). All four are why, not restatement; left standing.

- `web/app/assets/css/main.css:98-100` — shorten (43 words): Under the spec's 60-word threshold, and the length is the why (why gray, not red or green).
- `web/app/components/CookieConsentBar.vue:9` — remove: Co-reason alone is weak (62%): equal weight for accept/reject is a deliberate consent decision a reader would question.
- `web/app/components/CookieConsentBar.vue:22-25` — shorten (48 words): Under 60 words; explains why the height is measured rather than guessed.
- `web/app/components/LiveCourseBuyLink.vue:11-13` — remove: Co-reason alone is 60%; the comment states why this wrapper exists at all (tracking cannot be forgotten).
- `web/app/components/LiveCoursePromo.vue:239,241,243,245,247` — remove (restates the code): The `e.g.` samples give the expected format of bare `string` props; the format is nowhere in the code.
- `web/app/components/LiveCoursePromo.vue:251` — remove (restates the code): "Dates of lessons 1–5" defines what `Part1` covers, which the name does not.
- `web/app/components/ThankYouPage.vue:14-16` — remove: Co-reason 73%, but it defines the slot contract (default slot = copy, `action` = link) that callers must satisfy.
- `web/app/components/ThankYouPage.vue:46-49` — shorten (49 words): Under 60 words; rewritten for clarity instead, which shortened it anyway.
- `web/app/composables/cookie-consent.ts:29-35` — shorten (60 words): Not over 60; rewritten for clarity under the `rewrite` finding.
- `web/app/composables/watch-async-data-error.ts:5-9` — rewrite (hard to follow) + shorten (50 words): Reads in one pass: failure mode, then remedy, then why the global error hooks do not cover it. Under 60 words.
- `web/app/pages/dekujeme-za-objednavku-kurzu.vue:20-25` — shorten (48 words): Under 60 words; it is the only record of the SimpleShop return-URL contract.
- `web/app/plugins/clarity.client.ts:1-8` — shorten (53 words): Under 60 words; all of it is why (load gate vs. defaultConsent, where the id and masking live).
- `web/app/utils/live-courses.ts:1-11` — shorten (88 words): Over 60 but none of it is restatement: why the table is hardcoded, why not in the shop layer, and what the keys are anchored on.

Notes: Behaviour pass still owed: dead-code removals touched `web/app/pages/(homepage)/index.vue` (commented-out sections), `web/app/pages/pro-rodice.vue` (template + `<style>`) and `web/app/components/PageWrapper.vue`'s `.page-wrapper` rule, so drive the homepage, /pro-rodice and one PageWrapper page with the verify skill. In `web/app/plugins/meta-pixel.client.ts` I moved one sentence of existing rationale from the consent-watch block down to the `once` guard inside `track`, where it actually applies — it is a comment move, not a new comment, but it is the only edit that changed a comment's location. No files outside web/app were touched; I did not run git, formatters or check:all.

## Ticket 03 — web/layers/auth

Fixed 30, left standing 18.

- `web/layers/auth/app/composables/account.ts:10-14` — rewrite (undefined term, hard to follow) + shorten 44: Account/Author/Student are used in their exact GLOSSARY.md senses and the comment cites the glossary; 44 words is under the 60-word bar and each sentence carries a distinct why.
- `web/layers/auth/app/composables/auth.ts:13-14` — rewrite (undefined term): Leans only on Credentials (a type in the file) and ADR 0002, which exists at docs/adr/0002-nitro-mediated-auth-sessions.md.
- `web/layers/auth/app/composables/auth.ts:48-49` — rewrite (undefined term): Contains no capitalised domain term at all — session, payload and identity are plain words.
- `web/layers/auth/app/composables/emailed-token.ts:2` — remove (restates the code 76%): It fixes the capture order against the neighbouring `scrubbed` field, which the type does not say.
- `web/layers/auth/app/composables/emailed-token.ts:8-12` — shorten 58 words: Under the spec's 60-word bar, and the length is the why (history/referrer leak, SSR hydration), not restatement.
- `web/layers/auth/app/pages/overeni-emailu.vue:42-44` — rewrite (undefined term): Checkout and Account are now GLOSSARY.md headwords used in their glossary sense; ADR 0005 exists.
- `web/layers/auth/app/pages/prihlaseni.vue:62` — remove (answers a question no reader asks 61%): It names who sets EMAIL_VERIFIED_QUERY / PASSWORD_CHANGED_QUERY, which is not findable from this file.
- `web/layers/auth/nuxt.config.ts:1-4` — duplicate (also shop/nuxt.config.ts:1): The triple-slash reference it explains must exist per config file, so there is no single shared cause; the other copy is also outside my assigned paths.
- `web/layers/auth/server/api/auth/password-reset.post.ts:4` — remove (restates the code 72%, co-reason 41%): It explains an absence (no session is issued here), which `sendNoContent` cannot restate.
- `web/layers/auth/server/middleware/account-session.ts:1-8` — rewrite (hard to follow) + shorten 59: Under 60 words; the /api/** exclusion argument is intricate but precise and followable, and rewriting it would be churn.
- `web/layers/auth/server/utils/account-session.ts:1-2` — rewrite (undefined term): Only reference is ADR 0002, which exists.
- `web/layers/auth/server/utils/account-session.ts:43-47` — shorten 55 words: Under the 60-word bar and every sentence is a why (null vs throw, session untouched).
- `web/layers/auth/server/utils/account-session.ts:162-164` — remove (answers a question no reader asks 60%): It states that the client inherits Directus permission enforcement, which is the whole point of the function and not visible in its body.
- `web/layers/auth/server/utils/caller-client.ts:3-7` — rewrite (undefined term, hard to follow) + shorten 59: ADR 0004 exists, Author/Student are glossary senses, and the block is under 60 words.
- `web/layers/auth/server/utils/password-change.ts:26-30` — rewrite (hard to follow) + shorten 52: Under 60 words and the Directus session-claim argument reads cleanly as written.
- `web/layers/auth/shared/types/account.ts:11` — rewrite (undefined term): ADR 0002 is a real, findable repo reference used as a citation throughout this layer.
- `web/layers/auth/shared/types/account.ts:15` — remove (answers a question no reader asks 64%): "Epoch ms" disambiguates ms vs s on a bare `number`.
- `web/layers/auth/shared/utils/auth-messages.ts:15` — remove (answers a question no reader asks 61%): It warns that the Czech copy hardcodes the number PASSWORD_MIN_LENGTH holds, a coupling nothing else in the file shows.

Notes: Touched one file outside my area, as my ticket notes assign: web/layers/shop/app/components/checkout/RegisterForm.vue (deleted its two duplicate one-liners at the former lines 51 and 57). Ticket 06 still owns that file's own findings at lines 17-18 and 24-25 — another agent edited that template region while I worked, and my two deletions are independent of it. Per instructions I ran no git commands and no check:all, so the checks pass is still owed at commit time (the pre-commit hook covers it). Rewritten comments have never been graded, so expect the hook's lint-comments --staged to speak up on muj-ucet.vue, prihlaseni.vue, password-change.ts, password-reset.ts, registration.ts and shared/types/account.ts.

## Ticket 04 — shop-server

Fixed 21, left standing 29.

- `web/layers/shop/server/api/__sitemap__/courses.get.ts:3-12` — shorten (93 words): Spec-anchored header; every sentence is a why (anonymous client so an Author's drafts cannot leak, no lastmod because the public policy hides date_updated) — no restatement to cut.
- `web/layers/shop/server/api/account/billing.get.ts:3-6` — remove (answers a question no reader would ask, 64%): Weighed on the co-reason alone it still fails: the $CURRENT_USER scoping is why no user id appears in the route, which the code does not show.
- `web/layers/shop/server/api/account/billing.post.ts:5-12` — shorten (79 words): Length is the security rationale plus the invoice-snapshot consequence, not restatement.
- `web/layers/shop/server/api/checkout/[slug].get.ts:4-10` — rewrite (undefined term, 84%) + shorten (79): Checkout, Course, Account are GLOSSARY.md headwords in their glossary sense and ADR 0004/0005 are real references; the length is why.
- `web/layers/shop/server/api/checkout/[slug].post.ts:5-11 and :25-27` — shorten (72, 41 words): :25-27 is under the 60-word bar; :5-11 carries the price-tampering rationale (user story 27).
- `web/layers/shop/server/api/courses/[slug].get.ts:1-8` — shorten (75 words): Why the caller's own session decides draft visibility and ownership; the rewrite half of the finding was fixed (Service Account → Shop Service Account).
- `web/layers/shop/server/api/gopay/notify.get.ts:4-7` — shorten (53 words): Under the 60-word bar set by the spec.
- `web/layers/shop/server/api/pending-checkout.post.ts:1-4` — shorten (43 words): Under the 60-word bar.
- `web/layers/shop/server/middleware/pending-checkout.ts:3-11` — shorten (88 words): Rewritten for the 'hard to follow' half; the remaining length is the SSR/client-navigation reason the guard lives in middleware, which cannot be shortened without losing it.
- `web/layers/shop/server/utils/account-billing.ts:6-9` — shorten (47 words): Under the 60-word bar.
- `web/layers/shop/server/utils/checkout-order.ts:10-15` — shorten (72 words): File header stating the ADR 0004/0006 split between the Student's session and the Shop Service Account; rewritten for clarity, length kept.
- `web/layers/shop/server/utils/checkout-order.ts:38-40, :99-102, :109-112, :133-136, :163-166, :193-196` — shorten (44-52 words): All under the 60-word bar; the rewrite findings on :38-40 and :193-196 were the bare word 'spec', now anchored once in the file header.
- `web/layers/shop/server/utils/checkout-order.ts:78-82` — shorten (61 words): One word over the bar and entirely reason: why a failed GoPay inquiry means 'no reusable Payment'.
- `web/layers/shop/server/utils/course-query.ts:11-15` — shorten (55 words): Under the 60-word bar.
- `web/layers/shop/server/utils/course-query.ts:26-33 and :48-54` — shorten (92, 89 words): Rewritten for the 'hard to follow' half; each sentence answers a different why (draft safety, shared list, readonly tuple, unknown return), so nothing is restatement.
- `web/layers/shop/server/utils/entitlements.ts:6-10` — shorten (53 words): Under the 60-word bar; the rewrite half was fixed (Shop Service Account).
- `web/layers/shop/server/utils/gopay-api-client.ts:48-51` — shorten (48 words): Under the 60-word bar.
- `web/layers/shop/server/utils/gopay-client.ts:7-11` — shorten (49 words): Under the 60-word bar.
- `web/layers/shop/server/utils/gopay-mock-client.ts:8-12` — shorten (61 words): One word over the bar; it is the only statement of what the mock is and is not (process memory, dev fixture).
- `web/layers/shop/server/utils/order-return.ts:10-13` — rewrite (undefined term, 82%): Student, Order and ADR 0004 are used in their exact glossary/ADR sense.
- `web/layers/shop/server/utils/order-return.ts:15-18, :56-60` — shorten (49, 57 words): Under the 60-word bar.
- `web/layers/shop/server/utils/order-return.ts:36-40` — shorten (65 words): The reason readFirstRow is used instead of readOnlyRow — a paid Student must be told so even when the Course is gone. Deleting any of it deletes the rule.
- `web/layers/shop/server/utils/read-row.ts:18-19` — rewrite (undefined term, 84%): 'the shop's 404' is notFound() in the same layer and ADR 0004 is a real reference; the sense is exact.
- `web/layers/shop/server/utils/settle-payment.ts:9-16` — rewrite (undefined term, 81%) + shorten (79): Settlement, Payment, Order and Entitlement are now GLOSSARY.md headwords used in their glossary sense; the length is the idempotency argument.
- `web/layers/shop/server/utils/settle-payment.ts:100-103` — shorten (44 words): Under the 60-word bar.
- `web/layers/shop/server/utils/settle-payment.ts:118-122` — shorten (63 words): Rewritten for the 'hard to follow' half; the length is the reason the early return matters on GoPay's retry path.
- `web/layers/shop/server/utils/shop-errors.ts:1-4` — shorten (43 words): Under the 60-word bar.
- `web/layers/shop/server/utils/shop-errors.ts:9-12` — rewrite (undefined term, 85%) + shorten (42): Course, Order and ADR 0004 are exact; only the 'hard to follow' half was acted on, by splitting the sentence.
- `web/layers/shop/server/utils/shop-service-client.ts:3-11` — rewrite (undefined term, 82%; hard to follow, 82%) + shorten (93): It already writes Shop Service Account exactly and names the three writes ADR 0006 allows — that list is the contract, and it reads in order; cutting it would delete documentation.

Notes: No files outside web/layers/shop/server were touched. Two judgement calls worth a second look: (1) checkout-order.ts's header gained one new sentence pointing at `.aiwork/2026-09-15_checkout-gopay/spec.md` — strictly that is adding a comment, but it is what resolves the "undefined reference" findings on :38-40 and :193-196 without rewriting five comments, and there is precedent in web/layers/lms/nuxt.config.ts. (2) Three findings were acted on by cutting one sentence rather than the whole block (account/courses.get.ts:3-7, entitlements.ts:24-26) — the cut sentence was the defect the finding named. Comment-only diff, no runtime surface; checks and the pre-commit hook's regrade of the rewritten comments still have to run at commit time.

## Ticket 05 — web/layers/shop/shared

Fixed 13, left standing 12.

- `web/layers/shop/shared/utils/catalog-order.ts:1-4` — shorten (45 words): Under the spec's 60-word floor, and the length is the null-ordering reason, not restatement.
- `web/layers/shop/shared/utils/checkout.ts:126-129` — shorten (53 words): Under 60 words; it explains why only the newest reusable Order is offered.
- `web/layers/shop/shared/utils/gopay.ts:36-39` — shorten (50 words): Under 60 words; it defines what `undefined` means, which the code cannot say.
- `web/layers/shop/shared/utils/og-image.ts:1-9` — shorten (87 words): Spec-anchored header; every sentence is a why (OG size, fit=cover, why not $img(), why absolute), no restatement to cut.
- `web/layers/shop/shared/utils/owned-courses.ts:23-27` — shorten (57 words): Under 60 words; it explains the nullable `course` on the wire.
- `web/layers/shop/shared/utils/owned-courses.ts:33-37` — shorten (62 words): Two words over the floor and both halves are reasons (why unreadable rows are dropped, why the order).
- `web/layers/shop/shared/utils/pending-checkout.ts:3-7` — rewrite — leans on an undefined term: Checkout, Account and Course are GLOSSARY.md headwords used in their glossary sense; ADR 0005 is a real document in docs/adr/.
- `web/layers/shop/shared/utils/pending-checkout.ts:3-7` — shorten (63 words): Barely over the floor and it carries the security why (the cookie is set unauthenticated, so it holds only a slug).
- `web/layers/shop/shared/utils/pending-checkout.ts:15-19` — shorten (57 words): Under 60 words; it is the reason the regex is about separators rather than spelling.
- `web/layers/shop/shared/utils/pending-checkout.ts:42-45` — shorten (47 words): Under 60 words; states the precedence rule and why both candidates go through the auth layer.
- `web/layers/shop/shared/utils/price.ts:3-11` — shorten (83 words): Spec-anchored header whose length is all why (U+00A0 twice, hand-rolled rather than Intl for ICU independence).
- `web/layers/shop/shared/utils/sales.ts:7-11 and :20-24` — rewrite — leans on an undefined term (7-11); shorten (67 / 63 words): Sales Page, Course, Lesson, Entitlement are glossary headwords in their glossary sense and ADR 0004 exists; the length is the why for what the payload omits.

Notes: Nothing outside web/layers/shop/shared/ was touched, and no cross-area duplicate cluster from the spec falls in this area. Two notes for whoever commits: (1) checkout.ts:119-121 still says "area 10" in a comment the run did not flag — the rewritten TERMS_VERSION comment right above it now defines the term, so it resolves, but a future pass may want to align it; (2) all rewritten comments are ungraded, so expect lint-comments --staged in the pre-commit hook to grade them and possibly raise new findings to act on in the same commit.

## Ticket 06 — shop-app (`web/layers/shop/app`, `mock-gopay`, `nuxt.config.ts`)

Fixed 24, left standing 41.

- `web/layers/shop/app/components/account/Billing.vue:28-35` — rewrite → leans on an undefined term (84%): Checkout, Account, Student and ADR 0004 all carry their glossary/ADR sense exactly.
- `web/layers/shop/app/components/account/Billing.vue:28-35` — shorten (71 words): Spec-anchored header; the length is the why (why the fields are shared, why Nitro), not restatement.
- `web/layers/shop/app/components/account/MyCourses.vue:36-42` — rewrite (83%) + shorten (69 words): Glossary senses hold; the length explains why a shop component lives inside an auth page and why there is no error branch.
- `web/layers/shop/app/components/account/MyCourses.vue:45-46` — remove → answers a question the reader would not ask (63%): It explains why `default: () => []` exists at all — a reader does ask that.
- `web/layers/shop/app/components/account/MyCourses.vue:50-51` — remove → answers a question the reader would not ask (69%): It is the reason one generic message covers every failure; a copy decision, not a description.
- `web/layers/shop/app/components/billing/DetailsForm.vue:90-96` — shorten (73 words): Documents the component's contract (no heading, no submit, every field optional on purpose); nothing in it restates code.
- `web/layers/shop/app/components/catalog/CourseCard.vue:5-7` — rewrite → leans on an undefined term (85%): Author is a glossary headword in its exact sense and ADR 0004 resolves to docs/adr/0004.
- `web/layers/shop/app/components/checkout/AccountStep.vue:37-38` — rewrite → leans on an undefined term (87%): ADR 0005 is a resolvable reference; the verification link is the flow this prop is about.
- `web/layers/shop/app/components/checkout/AccountStep.vue:44-46` — shorten (42 words): Under the spec's 60-word threshold.
- `web/layers/shop/app/components/checkout/GuestPanel.vue:6-9` — shorten (52 words): Under the spec's 60-word threshold.
- `web/layers/shop/app/components/checkout/GuestPanel.vue:55-62` — shorten (92 words): The second paragraph documents a non-obvious a11y invariant (focus must follow selection or the keyboard user is stranded); cutting it would delete the reason the function exists.
- `web/layers/shop/app/components/checkout/GuestPanel.vue:84-85` — remove → answers a question the reader would not ask (62%): It is the only place that says why `.tabs` allows wrapping at all — a real question, and low grader confidence.
- `web/layers/shop/app/components/checkout/LogInForm.vue:42-44` — remove → answers a question the reader would not ask (68%): Carries the why the Checkout copy of the login form differs at all: there is nowhere to navigate to.
- `web/layers/shop/app/components/checkout/LogInForm.vue:46-47` — rewrite → leans on an undefined term (84%): ADR 0005 resolves; the sense of the prop is exact.
- `web/layers/shop/app/components/checkout/OrderForm.vue:3-4` — remove → answers a question the reader would not ask (61%): The title prop really does contain a literal U+00A0 (verified with hexdump); the comment stops someone 'fixing' it to an entity.
- `web/layers/shop/app/components/checkout/OrderForm.vue:48-51` — remove (66%) + shorten (44 words): The why for one `<form>` around two visually separate steps is not deducible from the code.
- `web/layers/shop/app/components/checkout/OrderForm.vue:59-60` — remove → answers a question the reader would not ask (68%): Answers 'why is there no watcher re-seeding the draft from the prop' — a question the next editor will ask.
- `web/layers/shop/app/components/checkout/Recap.vue:18-21` — remove (82%) + shorten (47 words): Spec-anchored header (user story 6) stating why the recap exists and why the delivery copy is static; the spec protects these.
- `web/layers/shop/app/components/checkout/Recap.vue:49-50` — remove → answers a question the reader would not ask (60%): It is the reason for `padding-inline-start: 0`, which otherwise looks arbitrary.
- `web/layers/shop/app/components/CourseCover.vue:12-17` — remove (68%) + shorten (65 words): Documents the deliberate empty alt text and that sizes/loading fall through as attributes; both are why, not what.
- `web/layers/shop/app/components/sales/Bespoke.vue:6-8` — remove → answers a question the reader would not ask (73%): 'A missing entry is the normal state, not an error' is the invariant the whole registry rests on.
- `web/layers/shop/app/components/sales/content/TestKurzPublikovany.vue:50-53` — remove (71%) + shorten (43 words): Carries a rule ('a price typed into this copy is a defect') that is recorded nowhere else in the file.
- `web/layers/shop/app/components/sales/Offer.vue:22-29` — shorten (84 words): Rewritten for clarity instead; the length is a three-state contract, not restatement.
- `web/layers/shop/app/components/sales/Outline.vue:24-26` — remove (66%) + shorten (42 words): The `bi` icon set being bundled rather than fetched from the iconify API at runtime is a real constraint.
- `web/layers/shop/app/composables/checkout-email.ts:4-13` — shorten (105 words) + rewrite → undefined term (82%): Rewritten for the 'hard to follow' half; Checkout is now a glossary headword, and the `flush: "sync"` explanation is load-bearing.
- `web/layers/shop/app/pages/kurzy/[slug].vue:33-35` — rewrite → leans on an undefined term (85%): Author/Student/Course used in their exact glossary senses; ADR 0004 resolves.
- `web/layers/shop/app/pages/kurzy/[slug].vue:48-53` — rewrite (83%) + shorten (66 words): Glossary senses hold; every sentence is a why (no SEO fields, cover fallback, getters for refetch).
- `web/layers/shop/app/pages/kurzy/index.vue:22-23` — remove → answers a question the reader would not ask (62%): Explains why no titleTemplate or canonical is set here; without it the omission looks like a bug.
- `web/layers/shop/app/pages/kurzy/index.vue:29-30` — rewrite → leans on an undefined term (81%): Author and ADR 0004 used exactly.
- `web/layers/shop/app/pages/objednavka/[id]/navrat.vue:6-9` — shorten (41 words): Under the spec's 60-word threshold.
- `web/layers/shop/app/pages/objednavka/[id]/navrat.vue:31-33` — rewrite → leans on an undefined term (84%): Student, Payment and Settlement are now glossary headwords used in their glossary sense.
- `web/layers/shop/app/pages/objednavka/[id]/navrat.vue:88-91` — shorten (49 words): Under the spec's 60-word threshold.
- `web/layers/shop/app/pages/objednavka/[slug].vue:64-66` — rewrite → leans on an undefined term (84%): ADR 0004 and Course used exactly; the comment's point (a refusal here is the page's refusal) is clear.
- `web/layers/shop/app/pages/objednavka/[slug].vue:99-103` — rewrite (81%) + shorten (67 words): Student and Billing Details are glossary headwords in sense; the length explains why step 2 needs nothing pushed into it.
- `web/layers/shop/app/utils/page-error.ts:1-6` — shorten (75 words): Whole-file header carrying the 404-wording rule (ADR 0004) and why `fatal` is set; a doc's job with no better home.
- `web/layers/shop/app/utils/pending-checkout.ts:1-11` — shorten (116 words): The 'never fatal' paragraph is the reason for the `.catch`; truncating it would delete the only record of that decision.
- `web/layers/shop/app/utils/sales-content.ts:4-14` — shorten (103 words): Explains why every entry is async (chunking plus keeping the module importable by plain vitest) — not restatement.
- `web/layers/shop/mock-gopay/server/api/gopay/mock/payments.post.ts:8-11` — shorten (51 words): Under the spec's 60-word threshold.
- `web/layers/shop/mock-gopay/server/api/gopay/mock/payments/[id].get.ts:1-3` — shorten (42 words): Under the spec's 60-word threshold.
- `web/layers/shop/mock-gopay/server/api/gopay/mock/payments/[id]/decide.post.ts:17-30` — shorten (140 words): It is the mock gateway's whole contract — the two payer actions, GoPay's ordering guarantee, and the button-less `choose` state. Nothing restates code and there is no doc to move it to.
- `web/layers/shop/nuxt.config.ts:1-4` — duplicate (also web/layers/auth/nuxt.config.ts:1): Each copy justifies the `/// <reference>` and eslint-disable directly beneath it, so it has to stay beside them; the other copy is ticket 03's file.

Notes: Nothing outside my paths was touched. Three things worth knowing: 1. `web/layers/shop/app/components/checkout/RegisterForm.vue:51` and `:57` (the two cross-area duplicate one-liners assigned to ticket 03) were already deleted in the working tree by the concurrent ticket-03 agent when I read the diff back. I did not touch them; the file now carries both my edits and theirs. 2. The "(spec, …)" reference convention — `(spec, user story 21)`, `(spec, "Metadata and structured data")` — is used ~30 times across the shop layer and is what several `rewrite → leans on an undefined term` findings flag. I left every one standing: naming a path in one comment while the other 29 keep the bare form would fracture the convention rather than fix it. If the team wants these to resolve, it is one cross-cutting task (point the layer at `.aiwork/2026-09-15_checkout-gopay/spec.md` once, e.g. from the layer's nuxt.config header), not a per-comment edit. Tickets 04 and 05 will hit the same findings in `shop/server` and `shop/shared`. 3. Per instructions I ran no checks and no formatter; `check:all` runs at commit time via the pre-commit hook. Several rewrites reflow comment blocks, so `vp staged` may adjust wrapping. The hook's `lint-comments --staged` will grade my 12 rewritten comments for the first time — act on what it reports inside this ticket.

## Ticket 07 — directus-lms (web/layers/directus, web/layers/lms)

Fixed 13, left standing 5.

- `web/layers/directus/nuxt.config.ts:1-3` — remove — answers a question the reader would not ask (60%) / it is a reason, not a description (87%): Weighed on the co-reason alone: a reader opening a file whose whole body is `defineNuxtConfig({})` does ask why it exists, and the comment also fixes the layer's boundary (Directus access only, no domain logic).
- `web/layers/directus/shared/types/directus.ts:101-105` — shorten — 56 words: Under the spec's 60-word threshold, so out of scope; the rewrite for clarity was applied and left it at ~55 words.
- `web/layers/directus/shared/utils/schemas.ts:3-6` — shorten — 41 words: Under the 60-word threshold, and it is the file header that makes the wire-type / consumer-contract split legible now that the per-interface repeats of it are gone.
- `web/layers/directus/shared/utils/schemas.ts:50-56` — rewrite — leans on an undefined term or reference (87%): Course, Live Course and Author are GLOSSARY.md headwords used in their glossary sense, and ADR 0004 resolves to docs/adr/0004-course-pages-read-through-nitro.md.
- `web/layers/directus/shared/utils/schemas.ts:50-56` — shorten — 78 words: Over 60, but the length is not restatement: it carries the public-policy reason (ADR 0004), why draft can still come back, and why routes and codecs share the one enum.

Notes: No files outside web/layers/directus/ and web/layers/lms/ were touched, and no cross-area duplicate cluster from the spec falls in this area. One observation for whoever works ticket 06: web/layers/shop/nuxt.config.ts:24 carries the same undefined "(areas 03–05)" reference as the lms marker I rewrote; I left it alone as it is outside my paths, and the same fix (naming .aiwork/2026-06-09_kurzy-platforma/areas.md) applies. Per the ticket rules I ran no checks, no formatter and no git commands; the rewritten comments have never been graded, so the pre-commit lint-comments --staged pass on this commit is the first look at them.

## Ticket 08 — web/tests (comment lint pass)

Fixed 24, left standing 24.

- `web/tests/probes/app-server.ts:6-12` — shorten (76 words): Every clause carries a why — why a real Nuxt server rather than a direct Directus probe, why no test framework, why NUXT_GOPAY_ENV=mock is forced; no restatement to cut.
- `web/tests/probes/app-server.ts:85` — remove — answers a question the reader would not ask (61%): It sits in an empty catch block, which is exactly the thing a reader stops on.
- `web/tests/probes/app-server.ts:100-101` — remove — answers a question the reader would not ask (66%): It bounds the class deliberately (one browser's cookies, the session cookie only), which the class name does not.
- `web/tests/probes/auth.probe.ts:17` — remove — answers a question the reader would not ask (62%): It says why a probe imports app code instead of duplicating the constant, which is the point of the import.
- `web/tests/probes/auth.probe.ts:66` — remove — answers a question the reader would not ask (65%): Explains why two production URLs are hard-coded and where they come from (authPageUrl); the constant names do not.
- `web/tests/probes/auth.probe.ts:70-73` — shorten (45 words): Under the spec's 60-word threshold, and it records a measured Directus rate limit.
- `web/tests/probes/auth.probe.ts:298` — remove — restates the code (73%): It justifies why every test in the block runs signed in, which the helper body does not say.
- `web/tests/probes/author-preview.probe.ts:52` — remove — restates the code (92%): It states why this nested shape is the one under test (it mirrors the Sales Page route), not what the line does.
- `web/tests/probes/author-preview.probe.ts:59-62` — shorten (51 words): Under the 60-word threshold; it records the observed Directus behaviour the assertions rest on.
- `web/tests/probes/author.probe.ts:19-27` — shorten (50 words): Under the threshold; spec-anchored probe header plus the required-environment block.
- `web/tests/probes/author.probe.ts:202-205` — shorten (41 words): Under the threshold; it explains the preset interplay with the folder-scoped read and delete rules.
- `web/tests/probes/author.probe.ts:269-272` — shorten (43 words): Under the threshold; the co-filed rewrite was applied instead.
- `web/tests/probes/billing-details.probe.ts:15-23` — shorten (56 words): Under the threshold, and most of the length is the required-environment block.
- `web/tests/probes/checkout-flow.probe.ts:8-17` — shorten (77 words): Over the threshold only because of the required-environment block; the prose is ~45 words of why.
- `web/tests/probes/public-cover.probe.ts:13-17` — shorten (56 words): Under the threshold; it documents the folder-name scoping rule the whole probe turns on.
- `web/tests/probes/shop-service.probe.ts:19-27` — shorten (63 words): Over the threshold only because of the required-environment block; the prose is spec- and ADR-anchored why.
- `web/tests/probes/student-scoping.probe.ts:19-28` — shorten (64 words): Same: the length is the required-environment block plus the fixture contract, not restatement.
- `web/tests/probes/support.ts:1-5` — shorten (49 words): Under the threshold; it is the file header that says why these probes are not in the default test run.
- `web/tests/probes/support.ts:33` — remove — restates the code (78%): It is the only thing that says what the bare UUID is; deleting it leaves an unidentifiable constant.
- `web/tests/probes/support.ts:163` — remove — answers a question the reader would not ask (62%): It says why the password is generated rather than a literal, which is the reason the helper exists.
- `web/tests/probes/support.ts:174-177` — shorten (49 words): Under the threshold; it explains why a failed cleanup throws on a shared instance.
- `web/tests/unit/catalog.test.ts:5-8` — shorten (46 words): Under the threshold; it contrasts with the Sales Page codec on `status`, which is the point of the fixture.
- `web/tests/unit/owned-courses.test.ts:5-8` — shorten (42 words): Under the threshold; it explains when `course` is null, which the fixture signature does not.
- `web/tests/unit/password.test.ts:25` — remove — answers a question the reader would not ask (68%): It says why the assertion exists (the Czech message must not drift from the constant), which the test title does not.

Notes: No files outside web/tests/ were touched and no docs moved. One note for whoever commits: the Czech quotes in these comments use the low opening quote with a straight closing quote („Objednávka zavazující k platbě"), which is the existing convention across the repo („Moje kurzy", „Koncept"). I left it as found rather than introducing a lone typographically correct closing quote in one file; fixing it is a repo-wide change, not a comment-lint one. Also, per the ticket I did not run lint-comments or check:all, so the rewritten comments are ungraded until the pre-commit hook sees them.

## Ticket 09 — certificate/

Fixed 23, left standing 12.

- `certificate/assets/jn-tokens.css:13, :14, :15, :18, :20` — remove — restates the code: They name where each brand colour is meant to be used (surface, accent, CTA), which the hex and token name do not say; and five unflagged siblings on lines 16, 17, 19, 21, 22 carry the same annotation, so deleting half would leave an arbitrarily ragged block.
- `certificate/assets/jn-tokens.css:61` — remove — answers a question the reader would not ask / it is a reason, not a description: Weighed on the co-reason alone per the spec's rule decision: it records where the scale comes from (Puleo Open-Props derivation, ~1.25 ratio), which is provenance no code states.
- `certificate/assets/jn-tokens.css:62, :63, :64, :65, :67` — remove — restates the code: The rem→px half is restatement but the role half (micro/labels, body, h3) is not, and lines 66, 68–71 carry the same annotation unflagged; a partial cut would leave the font-size table half-annotated. Whole-table decision, not a per-line one.
- `certificate/assets/jn-tokens.css:127` — remove — answers a question the reader would not ask / it is a reason, not a description: It is one of eight identical section banners in the file, seven unflagged; the parenthetical records the intent (match the live site's soft, low-contrast shadows) rather than restating the values.
- `certificate/app.js:157` — remove — restates the code: It decodes the magic constants in (297 * 96) / 25.4 — 96 dpi and 25.4 mm per inch — which the expression alone never names.

Notes: No files outside certificate/ touched; no code changes. Verified mechanically that every CSS declaration is byte-identical to HEAD (stripped comments and blank lines, diffed — the only difference in the whole file is the SPACING header prose), which covers the spec's "stray deletion is invisible to check:all" worry more tightly than an eyeball would; I did not render certificate/index.html, so if you want the spec's visual pass it is still outstanding. Two annotation tables in jn-tokens.css were flagged only in part by the grading run: brand colours (5 of 10 flagged) and font sizes (5 of 10 flagged). I left both alone rather than produce a half-annotated block. If the intent is to strip these tables, it needs a decision covering the unflagged lines too — outside this ticket's "do not touch unflagged comments" rule. The TODO in app.js now points at `.aiwork/<date>_certificate-into-nuxt`, a folder that does not exist (per ticket notes, I did not create it). It is a planned name, not a live path.

## Ticket 10

Fixed 8, left standing 5.

- `directus/extensions/email-subjects/index.js:24` — dead-code (commented-out code, 32%): False positive named in the ticket notes: a real JSDoc @type annotation.
- `directus/extensions/email-subjects/index.js:31` — dead-code (commented-out code, 36%): False positive named in the ticket notes: a real JSDoc @param annotation.
- `directus/sync.config.cjs:1-11` — shorten (72 words): Over 60 words but none of it is restatement: it carries the pull-only policy, the two workflow commands and the token rule, all of which the config keys cannot say.
- `directus/sync.config.cjs:17` — remove (answers a question the reader would not ask 63%; it is a reason, not a description 97%): Weighed on the co-reason alone, per the spec: a reader does ask why sortJson matters, and 'reviewable git diffs' is the purpose of the committed dump. Matches the reason-giving style of the three sibling keys.
- `directus/sync.config.cjs:21-25` — shorten (48 words): Under the 60-word threshold the spec set for shorten.

## Hook regrades at commit time

Each commit's `lint-comments --staged` graded the rewritten comments. Acted on
inside the ticket: two shop-app blocks tightened (`checkout-email.ts` header,
`objednavka/[slug].vue` 409 note), five auth comments (`prihlaseni.vue`
redirect note, `password-change.ts`, `password-reset.ts`, `registration.ts`,
`types/account.ts`), two shop-shared blocks (`BillingRequestSchema`,
`TERMS_VERSION`), one restating line in `directus/shared/utils/schemas.ts`,
and three test comments in a follow-up commit. What remained after that is
`shorten` on spec-anchored headers over 60 words (decision 2), `rewrite →
undefined term` on glossary headwords (decision 1b), the two TODOs that now
carry a folder or source-file reference instead of an issue id
(`certificate/app.js:1`, `email-subjects/index.js:1`), and the `dep-scan.mjs`
file header.

## Verification

- `vp run check:all` green on every commit (pre-commit hook).
- Ticket 02 behaviour and appearance: homepage, `/pro-rodice` and `/podcast`
  (PageWrapper) driven headless at 1280×900 and 375×800, no console errors.
  Screenshots in `screenshots/`: the homepage shows header, the „Výživa
  a výchova v propojení" hero card and the footer, unchanged; `/pro-rodice`
  shows the title, three audience pills and the webinar card, no trace of the
  removed courses section; `/podcast` shows title, intro, Spotify link, cover
  and the bonus cards. All three stack cleanly at 375px.
- Ticket 09: `certificate/index.html` served locally and rendered
  (`screenshots/certificate.png`): form panel and certificate preview intact.
  The token file's declarations, with comments stripped, are byte-identical to
  before the ticket.
- Ticket 00 wants a human read of the five new glossary entries.
