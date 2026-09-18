import { checkoutSlugFromPath } from "../../shared/utils/pending-checkout"

// Remembers which Checkout a visitor without an Account is on, so the
// verification link in their inbox can bring them back to it (ADR 0005).
//
// Middleware rather than the Checkout route itself, because both requests
// that open a Checkout have to be covered and only one of them is an API
// call: a `Set-Cookie` written during SSR's internal `$fetch` never reaches
// the browser (the same reason `account-session.ts` skips `/api/`), while a
// client-side navigation only ever hits `/api/checkout/<slug>`. Here, both
// are the request whose response the browser actually gets.
export default defineEventHandler(async (event) => {
  const slug = checkoutSlugFromPath(event.path)
  if (slug === null) {
    return
  }

  // Guarded the way `account-session.ts` guards its own read: reading the
  // session of a request that carries no session cookie would mint one, and
  // anonymous traffic is most of what opens a Checkout.
  const sealed = getCookie(event, useRuntimeConfig(event).session.name)
  const account = sealed === undefined ? undefined : (await readAccountSession(event)).account

  if (account === undefined) {
    setPendingCheckout(event, slug)
  } else {
    // Logged in on the Checkout: there is nothing left to come back to.
    clearPendingCheckout(event)
  }
})
