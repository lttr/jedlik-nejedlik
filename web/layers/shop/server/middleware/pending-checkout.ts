import { defineEventHandler } from "nuxt/server"

import { checkoutSlugFromPath } from "#layers/base/shared/utils/pending-checkout"
import { clearPendingCheckout, setPendingCheckout } from "../utils/pending-checkout"
import { readAccountSession } from "#layers/auth/server/utils/session-store"

// Remembers which Checkout a visitor without an Account is on, so the
// verification link can bring them back to it (ADR 0005). Middleware rather
// than the route: only the outer request's `Set-Cookie` reaches the browser.
// See docs/shop.md, „Pending checkout“.
export default defineEventHandler(async (event) => {
  const slug = checkoutSlugFromPath(event.url.pathname)
  if (slug === null) {
    return
  }

  const { account } = await readAccountSession(event)

  if (account === undefined) {
    setPendingCheckout(event, slug)
  } else {
    clearPendingCheckout(event)
  }
})
