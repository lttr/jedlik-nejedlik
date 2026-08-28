import type { Credentials } from "../../shared/types/student"

export interface AuthActions {
  logIn: (credentials: Credentials) => Promise<void>
  logOut: () => Promise<void>
  register: (registration: Credentials) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
}

// The only way the app talks to the auth routes. Credentials go out, a sealed
// cookie comes back — no Directus token ever touches the browser (ADR 0002).
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

    // Neither of these ends logged in: the new account is Unverified until the
    // e-mailed link is followed, and the Student logs in afterwards.
    async register(registration) {
      await $fetch("/api/auth/register", { method: "POST", body: registration })
    },

    async verifyEmail(token) {
      await $fetch("/api/auth/verify-email", { method: "POST", body: { token } })
    },
  }
}
