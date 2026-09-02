// A Student is a Directus end-user identity (GLOSSARY.md), never "user" or
// "account" in our own identifiers. The e-mail is a cache of the
// `directus_users` row set at login, never queried or written back (ADR 0002).
export interface Student {
  email: string
}

// Never leaves the server (ADR 0002).
export interface StudentSecrets {
  accessToken: string
  refreshToken: string
  // Epoch ms. Directus access tokens last 15 minutes (probe).
  accessTokenExpiresAt: number
}

export interface Credentials {
  email: string
  password: string
}

// The current password is asked for so a stolen session cookie alone cannot
// take the account over; Directus itself has no such check.
export interface PasswordChange {
  currentPassword: string
  newPassword: string
}
