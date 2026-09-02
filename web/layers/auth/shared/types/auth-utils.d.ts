import type { Student, StudentSecrets } from "./student"

// nuxt-auth-utils' key names: `user` is serialised to the client, `secure`
// never leaves the server. Member-by-member because
// `interface User extends Student {}` is an empty object type the lint bans.
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
