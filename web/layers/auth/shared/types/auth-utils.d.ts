import type { Account, AccountSecrets } from "./account"

// nuxt-auth-utils' key names: `user` is serialised to the client, `secure`
// never leaves the server. Member-by-member because
// `interface User extends Account {}` is an empty object type the lint bans.
declare module "#auth-utils" {
  interface User {
    email: Account["email"]
  }

  interface SecureSessionData {
    accessToken: AccountSecrets["accessToken"]
    refreshToken: AccountSecrets["refreshToken"]
    accessTokenExpiresAt: AccountSecrets["accessTokenExpiresAt"]
  }
}
