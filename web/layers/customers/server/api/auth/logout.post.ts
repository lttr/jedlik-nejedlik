import { logout } from "@directus/sdk"

export default defineEventHandler(async (event) => {
  const refreshToken = getDirectusRefreshToken(event)
  if (refreshToken !== undefined) {
    // Best effort: the local session goes either way, and a refresh token
    // Directus has already forgotten is not an error worth surfacing.
    await getDirectusAnonymousServerClient(event)
      .request(logout({ mode: "json", refresh_token: refreshToken }))
      .catch(() => undefined)
  }
  clearDirectusSession(event)
  return { student: null }
})
