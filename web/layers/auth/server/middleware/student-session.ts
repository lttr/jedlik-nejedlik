// Keeps a live session's Directus tokens (and the cookie's 30-day window)
// rolling while a Student browses.
//
// `/api/**` is excluded: the auth routes manage the session themselves, and
// nuxt-auth-utils' internal `/api/_auth/session` request carries the
// *original* cookie, so a refresh there would rotate the token onto a
// response whose `Set-Cookie` never reaches the browser. `/_` covers Nitro's
// own namespaces (`/_nuxt`, `/_ipx`).
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
    await resolveStudentAccessToken(event)
  } catch {
    // Already logged. A token we could not renew must not take a public page
    // down; the next request tries again.
  }
})
