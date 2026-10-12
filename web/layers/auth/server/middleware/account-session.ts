import { defineEventHandler } from "nuxt/server"

import { resolveAccountAccessToken } from "../utils/account-session"
import { readAccountSession } from "../utils/session-store"

// Per page render: renew due Directus tokens (sliding the cookie's 30 days)
// and hand the Account, never the secrets, to the `account.server` plugin.
// API routes resolve the session themselves; `/_` is Nuxt's own traffic.
export default defineEventHandler(async (event) => {
  const { pathname } = event.url
  if (pathname.startsWith("/api/") || pathname.startsWith("/_")) {
    return
  }

  try {
    await resolveAccountAccessToken(event)
  } catch {
    // Already logged. A token we could not renew must not take a public page
    // down; the next request tries again.
  }
  // Read after the refresh: a session Directus refused is gone by now.
  event.context.account = (await readAccountSession(event)).account
})
