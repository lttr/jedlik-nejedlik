// A Student is a Directus end-user identity (GLOSSARY.md) — never called user
// or account in our own identifiers, even though nuxt-auth-utils' wire format
// names the client-visible session payload `user`.
//
// v1 knows only the e-mail, and it is a cache of the `directus_users` row,
// not a second store of identity: derived at login, never queried, never
// written back (ADR 0002, Consequences).
export interface Student {
  email: string
}

// The half of the session that never leaves the server. Directus tokens live
// here and nowhere else — not in the client payload, not in JavaScript-visible
// storage (ADR 0002).
export interface StudentSecrets {
  accessToken: string
  refreshToken: string
  // Epoch ms. Directus access tokens last 15 minutes (measured by
  // tests/probes/auth.probe.ts); past this the session refreshes.
  accessTokenExpiresAt: number
}

// What the login form sends and the login route reads. Shared so the app side
// never has to reach into the layer's server code for a type.
export interface Credentials {
  email: string
  password: string
}

// What the account page's change-password form sends. The current password is
// asked for so that a stolen session cookie alone cannot take the account
// over — Directus has no notion of it, this is the app's own gate.
export interface PasswordChange {
  currentPassword: string
  newPassword: string
}
