// Session shape for `nuxt-auth-utils`. The module merges these interfaces into
// its `#auth-utils` types, which is what makes `useUserSession().user` and
// `setUserSession()` typed.
//
// The split matters: `User` is sealed into the cookie *and* served to the
// browser by GET /api/_auth/session, while `SecureSessionData` never leaves the
// server. Directus tokens therefore go in `secure` and nowhere else.
declare module "#auth-utils" {
  interface User {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }

  interface SecureSessionData {
    accessToken: string
    refreshToken: string
    // Absolute expiry in epoch ms, derived from Directus's `expires` (a TTL in
    // ms). Stored absolute so refresh decisions need no request timing.
    expiresAt: number
  }
}
