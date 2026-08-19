// The only way the app talks to the auth routes. Credentials go out, a
// Student (or nothing) comes back — no Directus token ever touches the
// browser.
export interface AuthActions {
  logIn: (credentials: { email: string; password: string }) => Promise<void>
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

    async logOut() {
      await $fetch("/api/auth/logout", { method: "POST" })
      student.value = null
    },
  }
}
