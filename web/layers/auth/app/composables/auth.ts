import type { Credentials } from "../../shared/types/student"

export interface AuthActions {
  logIn: (credentials: Credentials) => Promise<void>
  logOut: () => Promise<void>
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
  }
}
