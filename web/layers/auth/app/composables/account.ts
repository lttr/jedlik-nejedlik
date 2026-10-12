import type { Account } from "#layers/auth/shared/types/account"

export interface AccountSession {
  account: ComputedRef<Account | null>
  loggedIn: ComputedRef<boolean>
  // For the auth actions: login sets the Account it got back, logout clears it.
  setAccount: (account: Account | null) => void
}

// Pages speak Account (GLOSSARY.md), never the session. The state is filled
// during SSR from the session cookie (`account.server` plugin) and travels in
// the payload, so SSR and client agree without a round-trip.
export function useAccount(): AccountSession {
  const state = useState<Account | null>("account", () => null)
  return {
    account: computed(() => state.value),
    loggedIn: computed(() => state.value !== null),
    setAccount(account) {
      state.value = account
    },
  }
}
