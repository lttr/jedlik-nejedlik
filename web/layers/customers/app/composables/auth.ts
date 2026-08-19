// The only way the app talks to the auth routes. Credentials go out, a
// Student (or nothing) comes back — no Directus token ever touches the
// browser.
export interface Credentials {
  email: string
  password: string
}

export interface AuthActions {
  logIn: (credentials: Credentials) => Promise<void>
  register: (credentials: Credentials) => Promise<void>
  logOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<string>
  resetPassword: (reset: { token: string; password: string }) => Promise<string>
  changePassword: (password: string) => Promise<string>
}

export function useAuthActions(): AuthActions {
  const student = useStudentState()

  return {
    async logIn(credentials) {
      const { student: session } = await $fetch("/api/auth/login", {
        method: "POST",
        body: credentials,
      })
      student.value = session
    },

    async register(credentials) {
      const { student: session } = await $fetch("/api/auth/register", {
        method: "POST",
        body: credentials,
      })
      student.value = session
    },

    async logOut() {
      await $fetch("/api/auth/logout", { method: "POST" })
      student.value = null
    },

    async requestPasswordReset(email) {
      const { message } = await $fetch("/api/auth/password-request", {
        method: "POST",
        body: { email },
      })
      return message
    },

    async resetPassword(reset) {
      const { message } = await $fetch("/api/auth/password-reset", {
        method: "POST",
        body: reset,
      })
      return message
    },

    async changePassword(password) {
      const { message } = await $fetch("/api/auth/change-password", {
        method: "POST",
        body: { password },
      })
      return message
    },
  }
}
