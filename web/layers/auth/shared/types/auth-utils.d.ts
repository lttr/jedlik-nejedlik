import type { Student, StudentSecrets } from "./student"

// Maps our Student-named session shape onto nuxt-auth-utils' own key names:
// `user` is serialised to the client, `secure` never leaves the server.
// Written member-by-member because `interface User extends Student {}` is an
// empty object type, which the lint rules ban.
declare module "#auth-utils" {
  interface User {
    email: Student["email"]
  }

  interface SecureSessionData {
    accessToken: StudentSecrets["accessToken"]
    refreshToken: StudentSecrets["refreshToken"]
    accessTokenExpiresAt: StudentSecrets["accessTokenExpiresAt"]
  }
}
