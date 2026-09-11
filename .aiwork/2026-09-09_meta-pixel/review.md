---
reviewed_sha: 29d3530479d5aeab9f39a751ca2e966b0c8978ed
references:
  - "Spec: ./spec.md"
  - "Branch: meta-pixel"
  - "Reviewed: /code-review xhigh --fix over the three ticket commits"
---

# Review — Meta Pixel + cookie consent

## Outcome

Green. `vp run check:all` exits 0 on the merged branch, before and after the
wrap-up fixes. Three tickets done, one planning commit plus
three feature commits, with the wrap-up fixes in a fourth.

Twelve findings. Two were fixed by the review itself, four more were applied
during wrap-up, six were left with reasons. Nothing found was a defect in the
consent gate itself: before a decision and after **Odmítnout**, no request
reaches any Meta host, which is the legally load-bearing claim and the one
verified most often.

## Fixed by the review

| #   | Finding                                                                                                                                              | Fix                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 2   | `claimOncePerSession` touched `sessionStorage` unguarded; it throws where the browser refuses storage, taking the whole `Purchase` call down with it | try/catch, an unavailable store treated as "slot free" so the sale is still measured |
| 4   | `127.0.0.1` was missing from `IGNORED_HOSTNAMES`, so a local production build loaded the real pixel and sent real events                             | Added, with a comment that a local `.output` preview is not `import.meta.dev`        |

## Fixed during wrap-up

| #   | Finding                                                                                                                                              | Fix                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Withdrawing consent never reached an already-loaded pixel, so it kept running for the rest of the SPA session                                        | A watcher sends `fbq("consent","revoke")` on withdrawal and `grant` only to undo one     |
| 9   | The fixed bar covered the last ~180px of every page at 375px, the footer's own consent control among them                                            | Bar height measured (border-box) and applied as `padding-block-end` on `body` while open |
| 7   | Extracting `ThankYouPage.vue` silently changed the newsletter page's signature from grey to brand navy, because the `p` rule became `:slotted`       | Rule now matches the component's own `p` too, restoring the pre-extraction rendering     |
| 10  | The rewritten Cookies chapter described only Plausible and Meta, implying the site sets no other cookies — but the auth layer ships a session cookie | One paragraph naming the necessary login cookie                                          |

Finding 1 is the one that mattered. The spec accepted "withdrawal takes effect
on the next page load" on the premise that `@nuxt/scripts` cannot unload a
loaded script. The premise is true and the conclusion still wrong: the script
cannot be unloaded, but Meta's own consent call stops the loaded pixel from
sending. The accepted limitation was therefore larger than it needed to be, and
the privacy policy's withdrawal sentence has been corrected to match the
behaviour that now ships.

## Left unfixed, with reasons

| #   | Finding                                                                                                                                                     | Why not                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3   | The online course's buy link navigates in the same tab, so its `InitiateCheckout` races the unload and under-reports against the two `target="_blank"` ones | The only clean fix is `target="_blank"`, which ticket 02 forbids ("unchanged look, `target` and `rel`"). A product decision                                                                |
| 5   | Each `useCookieConsent()` call builds its own `useStorage` binding, so the bar and the plugin agree only via a successful `localStorage` write              | A shared source of truth is an SSR-sensitive refactor (the footer control renders during SSR); the failure needs a storage-blocked browser, where the pixel arguably should not run anyway |
| 6   | The once-per-session slot is claimed before the event is delivered, so a `Purchase` queued and then lost with the tab can never be retried                  | Claiming from the script's `onLoaded` instead is right but unverifiable outside production                                                                                                 |
| 8   | `.lead` referenced `var(--text-1)`, which no stylesheet defines                                                                                             | Pre-existing, not a regression. Replaced with an explicit `color: inherit` plus a comment — a faithful no-op, since naming a real token would change the rendered colour                   |
| 11  | No `PageView` on client-side route changes, so Meta sees one PageView per visit and cannot build URL-based audiences                                        | Nothing in the spec asks for it; a question for the marketer, in the handoff note                                                                                                          |
| 12  | `startDate` in `LIVE_COURSES` restates dates also hardcoded as prose in the promo components, in a different format                                         | Knowingly half-resolved in ticket 03; driving the promo copy from the table would change its rendered date format                                                                          |

## Verification

Every pixel behaviour was exercised against a real production build, never
asserted from config. Because `127.0.0.1` is now an ignored hostname, the
wrap-up pass served the build on `127.0.0.2:3100` and routed
`connect.facebook.net` to a 404, so every `fbq` call the app makes lands
verbatim in `window.fbq.queue`.

Confirmed there: a fresh session sends no `consent` call on first acceptance
(the guard against a `grant` before Meta's `init`); withdrawal without a reload
sends exactly one `revoke`, re-acceptance one `grant`; a first-time
**Odmítnout** makes zero Meta requests. At 375px the footer's consent control
now sits fully above the bar and is hittable, and the padding is gone after a
decision. The signature renders `#495057` with the smaller margin on all three
thank-you URLs, matching `af4c439`.

What no local pass can reach: that events actually arrive at Meta. Meta
suppresses the `www.facebook.com/tr` beacon for unregistered domains, so all
three tickets proved what the site _sends_, not what Meta _receives_. The
marketer closes that in Events Manager, as the spec assigns.
