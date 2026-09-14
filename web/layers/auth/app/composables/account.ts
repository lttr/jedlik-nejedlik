import type { Account } from "../../shared/types/account"

export interface AccountSession {
  account: ComputedRef<Account | null>
  loggedIn: ComputedRef<boolean>
  // Re-reads the session after a login or logout changed the cookie.
  refresh: () => Promise<void>
}

// The single seam onto nuxt-auth-utils' client API. Identical on SSR and
// client because the answer comes from the sealed cookie's payload, not a
// round-trip. Pages speak Account (GLOSSARY.md), never `useUserSession()`.
// It is `useAccount`, not `useStudent`: an Author previewing a draft holds
// the same session.
export function useAccount(): AccountSession {
  const { user, loggedIn, fetch } = useUserSession()
  return { account: user, loggedIn, refresh: fetch }
}
