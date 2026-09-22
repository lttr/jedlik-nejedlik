// The e-mail is cached from the `directus_users` row at login, never written
// back (ADR 0002).
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
