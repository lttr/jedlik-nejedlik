import { defineEventHandler } from "nuxt/server"

import { resolveAccountAccessToken } from "../utils/account-session"
import { readAccountSession } from "../utils/session-store"

// Keeps a live session's Directus tokens and the cookie's 30-day window
// rolling, and hands the page render its Account (never the secrets) through
// the request context; the `account.server` plugin takes it from there.
// `/api/**` and `/_` are not page renders: each API route resolves the
// session itself, and `/_` is Nuxt's own traffic.
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
