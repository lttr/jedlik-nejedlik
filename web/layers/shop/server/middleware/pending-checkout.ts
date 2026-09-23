import { checkoutSlugFromPath } from "#layers/shop/shared/utils/pending-checkout"
import { clearPendingCheckout, setPendingCheckout } from "../utils/pending-checkout"
import { readAccountSession } from "#layers/auth/server/utils/session-store"

// Remembers which Checkout a visitor without an Account is on, so the
// verification link can bring them back to it (ADR 0005). Middleware rather
// than the route: only the outer request's `Set-Cookie` reaches the browser.
// See docs/shop.md, „Pending checkout“.
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
    clearPendingCheckout(event)
  }
})
