import { logout } from "@directus/sdk"

// Revoke the refresh token at Directus (best effort) and clear our cookies.
export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, COOKIE_REFRESH)

  if (refreshToken !== undefined && refreshToken !== "") {
    try {
      await getDirectusRest(event).request(logout({ refresh_token: refreshToken, mode: "json" }))
    } catch {
      // Token already expired/invalid — clearing the cookies below is enough.
    }
  }

  clearAuthCookies(event)
  setResponseStatus(event, 204)
  return null
})
