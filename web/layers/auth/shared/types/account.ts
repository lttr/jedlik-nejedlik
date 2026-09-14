// An Account is a Directus identity that can log in, whoever holds it: a
// Student or a staff Author previewing a draft (GLOSSARY.md). It is what a
// session represents, so the session plumbing says Account, never "user" or
// "student"; Student is the learner and buyer, and stays on the Directus
// columns that belong to one. The e-mail is a cache of the `directus_users`
// row set at login, never queried or written back (ADR 0002).
export interface Account {
  email: string
}

// Never leaves the server (ADR 0002).
export interface AccountSecrets {
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
