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
  }
}
