import type { Student } from "../../shared/types/student"

export interface StudentSession {
  student: ComputedRef<Student | null>
  loggedIn: ComputedRef<boolean>
  // Re-reads the session after a login or logout changed the cookie.
  refresh: () => Promise<void>
}

// The single seam onto nuxt-auth-utils' client API, and the one way the app
// asks who is logged in. Identical on SSR and client: the answer comes from
// the sealed cookie's payload, not from a round-trip, so there is nothing to
// flicker between. Pages and components speak Student (GLOSSARY.md) — they
// never see `useUserSession()`.
export function useStudent(): StudentSession {
  const { user, loggedIn, fetch } = useUserSession()
  return { student: user, loggedIn, refresh: fetch }
}
