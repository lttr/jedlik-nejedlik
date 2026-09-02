import type { Credentials, PasswordChange } from "../../shared/types/student"

export interface AuthActions {
  logIn: (credentials: Credentials) => Promise<void>
  logOut: () => Promise<void>
  register: (registration: Credentials) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  changePassword: (change: PasswordChange) => Promise<void>
}

// The only way the app talks to the auth routes. Credentials go out, a sealed
// cookie comes back; no Directus token ever touches the browser (ADR 0002).
export function useAuthActions(): AuthActions {
  const { refresh } = useStudent()

  return {
    async logIn(credentials) {
      await $fetch("/api/auth/login", { method: "POST", body: credentials })
      await refresh()
    },

    async logOut() {
      await $fetch("/api/auth/logout", { method: "POST" })
      await refresh()
    },

    // Neither ends logged in: the account is Unverified until the e-mailed
    // link is followed, and the Student logs in afterwards.
    async register(registration) {
      await $fetch("/api/auth/register", { method: "POST", body: registration })
    },

    async verifyEmail(token) {
      await $fetch("/api/auth/verify-email", { method: "POST", body: { token } })
    },

    // Neither reset leg logs anyone in either.
    async requestPasswordReset(email) {
      await $fetch("/api/auth/password-request", { method: "POST", body: { email } })
    },

    async resetPassword(token, password) {
      await $fetch("/api/auth/password-reset", { method: "POST", body: { token, password } })
    },

    // Re-seals this session and ends every other; the payload's identity is
    // unchanged, so there is nothing to re-read.
    async changePassword(change) {
      await $fetch("/api/auth/change-password", { method: "POST", body: change })
    },
  }
}
