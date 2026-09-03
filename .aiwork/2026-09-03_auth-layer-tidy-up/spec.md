---
status: not-started
references:
  - 'Source: ../2026-08-19_auth-customers/implementation-notes.md ("Follow-ups the implementer noted but did not take")'
  - "Area: ../2026-06-09_kurzy-platforma/areas.md (area 02, closed 2026-09-03)"
---

# Follow-up — auth layer tidy-up

Cleanups the area 02 implementers recorded and deliberately did not take,
collected here on 2026-09-03 so closing the area does not lose them. The
first five are quality work: **no user-visible behaviour changes**, so
none of them is urgent on its own. The natural time to do them is the next
time someone opens the auth layer for a real reason. Item 6 is different —
it came from the user, it changes what people see, and it needs
prototyping before it needs code.

The one genuinely user-visible bug found in the same pass — the doubled
site name in page titles — is **not** here; it went to
`../2026-09-03_unify-org-name/spec.md` (scope item 4), where it belongs.

## Items

### 1. Collapse the converged Directus auth calls

`registration.ts` and `password-reset.ts` hold four structurally identical
function pairs plus one duplicated comment paragraph. The shape that
closes it is a single helper:

```ts
callDirectusAuth(event, request, { context, unavailable, codes })
```

**One asymmetry must survive the merge.** On an unknown Directus error
code, verify falls through to a 502; reset treats any answered code as a
dead link. Collapsing that distinction by accident would start showing
502s to users following an expired reset link. Encode it in `codes` (or
an explicit fallback per caller) rather than letting the helper pick.

Touches ticket 03's and 04's files. Largest item here.

### 2. Decide between `useAuthForm()` and `useAsyncRequest()`

`useAuthForm()` overlaps the existing `app/composables/useAsyncRequest()`,
which additionally carries a 25 s timeout and an `isSuccess` state the
auth one lacks. The rework brief explicitly said keep `useAuthForm()`, so
the implementer did — this is a judgement call to make deliberately, not
a defect. Either merge them (and inherit the timeout) or write down why
the auth flow wants its own.

### 3. Extract the shared form card

`AuthPanel`'s card style is the fifth copy of the `.form-wrapper` block
duplicated across four marketing forms. Extracting one shared card
component touches those four files, which is why it was out of scope for
an auth ticket. Pure cleanup, low risk, no behaviour change.

### 4. Hoist `LOGIN_PATH`

`"/prihlaseni"` is a literal in **8 places across 5 files** in the layer
(verified by grep on 2026-09-03): `layers/auth/nuxt.config.ts`,
`app/middleware/auth.ts`, `app/pages/registrace.vue`,
`app/pages/obnova-hesla.vue`, `app/pages/overeni-emailu.vue`. Hoist it to
a const in `redirects.ts` next to the other route constants. Smallest
item on the list.

### 5. Replace the triple-slash reference with a shared ambient declaration

`layers/auth/nuxt.config.ts` still carries PR #16's triple-slash
reference into `../../.nuxt/types/nuxt-robots-nitro.d.ts`, behind an
eslint-disable. It works. A shared ambient declaration would fix it once
for every layer instead of per layer.

### 6. Move the login entry point out of the main nav into the top bar

**Reported by the user on 2026-09-03.** This is the one item here with a
user-visible motive rather than a code-quality one, and the only one that
needs design work before it needs code.

The problem: `Přihlásit se` is currently the sixth `<li>` in the main nav
list, styled identically to the five content links beside it
(`web/app/components/layout/MainNav.vue:26`).

```
O nás | Pro rodiče | Pro odborníky | Podcast | Kontakt | Přihlásit se
```

An account action reads as just another section of the site. The user
wants it moved to the very top bar, above the main nav, where it is
visually separate from content navigation.

The top bar already exists: `web/app/components/layout/Header.vue`
renders a `.top-line` above `<MainNav>` that today holds only
`<SocialLinks />`, right-aligned (`justify-content: end`), at
`--font-size-0` with `--space-3` block padding. So this is a move into an
existing slot, not a new bar.

**Prototyping first — this is a design question, not a code task.** Things
to settle before writing the final markup:

- Where in `.top-line` it sits relative to the social icons, and whether
  the two need a separator or a gap change.
- Whether it stays a plain link or becomes a small button. The top bar's
  visual weight is low, and it currently contains only icons.
- Whether it carries an icon (a person/account glyph) — the bar is
  icon-only today, so a bare word may look out of place.
- The logged-in counterpart. The nav swaps `Přihlásit se` for
  `Můj účet` on `loggedIn`, so both states move together and both need
  to look right.
- **Mobile.** `.nav-wrapper` switches to `flex-direction: column` below
  `--md-n-below`, and `.top-line` has no mobile treatment at all. Check
  375px explicitly; a top bar that works on desktop can vanish or crowd
  on a phone.

The move itself touches `MainNav.vue` (drop the `<li>`) and `Header.vue`
(add it to `.top-line`), and the `useStudent()` call moves with it.
Story 20 in area 02's spec — "the site header reflects my state" — stays
satisfied either way; this changes only where that state is shown.

Verify with the `verify` skill in both states, logged out and logged in,
at desktop and 375px.

## Explicitly not doing

- **A generalised notice registry** (`AUTH_NOTICE_QUERY` plus a message
  map). It would pay off at three flows; change-password stays on
  `/muj-ucet` and probably never becomes the third. Revisit only if a
  third flow appears.

## Verification

- `vp run check:all` green.
- The `verify` skill over login, registration, password reset and change
  password — these are refactors of live flows, so a green `check:all` is
  not enough on its own.
- For item 6: both header states (logged out, logged in) driven at
  desktop width and at 375px.
- For item 1 specifically: prove the asymmetry survived. An expired reset
  link must still render the Czech dead-link panel, and an unknown code
  on verify must still produce a 502.
