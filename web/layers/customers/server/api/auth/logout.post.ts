import { logout } from "@directus/sdk"

// Revoking the refresh token at Directus is best effort: if that call fails the
// Student must still end up signed out here, so the session is cleared either
// way. The worst case is a refresh token that stays valid at Directus until it
// expires on its own — and nothing holds it any more, because the cookie is gone.
export default defineEventHandler(async (event) => {
  const { secure } = await getUserSession(event)

  if (secure !== undefined) {
    try {
      await getServerDirectusClient().request(
        logout({ refresh_token: secure.refreshToken, mode: "json" }),
      )
    } catch {
      // Intentionally ignored — see above.
    }
  }

  await clearUserSession(event)
})
