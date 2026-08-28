// Keeps a live session's Directus tokens (and with them the sealed cookie's
// 30-day window) rolling while a Student browses, without any Directus call
// on a request that does not need one.
//
// `/api/**` is excluded on purpose: the auth routes manage the session
// themselves, and nuxt-auth-utils' internal `/api/_auth/session` render-time
// request carries the *original* cookie — refreshing there would rotate the
// refresh token onto a response whose `Set-Cookie` never reaches the browser.
// `/_` covers Nitro's own namespaces (`/_nuxt`, `/_ipx`).
export default defineEventHandler(async (event) => {
  if (event.path.startsWith("/api/") || event.path.startsWith("/_")) {
    return
  }
  // Anonymous traffic — the overwhelming majority on a public site — stops
  // here, before h3 materialises a session object and mints an id for it.
  if (getCookie(event, useRuntimeConfig(event).session.name) === undefined) {
    return
  }

  try {
    await resolveStudentAccessToken(event)
  } catch {
    // `unexpectedAuthError` already logged the cause. A token we could not
    // renew must not take a public page down: the session survives untouched
    // and the next request tries again.
  }
})
