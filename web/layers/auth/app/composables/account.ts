import type { Account } from "../../shared/types/account"

export interface AccountSession {
  account: ComputedRef<Account | null>
  loggedIn: ComputedRef<boolean>
  // Re-reads the session after a login or logout changed the cookie.
  refresh: () => Promise<void>
}

// The app's only seam onto nuxt-auth-utils: pages speak Account (GLOSSARY.md),
// never `useUserSession()`. The answer comes from the session cookie's payload,
// so SSR and client agree without a round-trip.
export function useAccount(): AccountSession {
  const { user, loggedIn, fetch } = useUserSession()
  return { account: user, loggedIn, refresh: fetch }
}
