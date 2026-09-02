import type { Student } from "../../shared/types/student"

export interface StudentSession {
  student: ComputedRef<Student | null>
  loggedIn: ComputedRef<boolean>
  // Re-reads the session after a login or logout changed the cookie.
  refresh: () => Promise<void>
}

// The single seam onto nuxt-auth-utils' client API. Identical on SSR and
// client because the answer comes from the sealed cookie's payload, not a
// round-trip. Pages speak Student (GLOSSARY.md), never `useUserSession()`.
export function useStudent(): StudentSession {
  const { user, loggedIn, fetch } = useUserSession()
  return { student: user, loggedIn, refresh: fetch }
}
