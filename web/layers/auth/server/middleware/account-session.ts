import { resolveAccountAccessToken } from "../utils/account-session"

// Keeps a live session's Directus tokens and the cookie's 30-day window
// rolling. `/api/**` and `/_` are excluded: a refresh on nuxt-auth-utils' own
// session request would rotate the token onto a `Set-Cookie` the browser never
// sees.
export default defineEventHandler(async (event) => {
  if (event.path.startsWith("/api/") || event.path.startsWith("/_")) {
    return
  }
  // Anonymous traffic stops here, before h3 materialises a session and mints
  // an id for it.
  if (getCookie(event, useRuntimeConfig(event).session.name) === undefined) {
    return
  }

  try {
    await resolveAccountAccessToken(event)
  } catch {
    // Already logged. A token we could not renew must not take a public page
    // down; the next request tries again.
  }
})
