import type { Account } from "#layers/auth/shared/types/account"

export interface AccountSession {
  account: ComputedRef<Account | null>
  loggedIn: ComputedRef<boolean>
  setAccount: (account: Account | null) => void
}

// The logged-in Account, as pages see it; nothing outside the server touches
// the session itself. The `account.server` plugin fills the state during SSR
// and the payload carries it to the browser, so SSR and client agree without
// a request.
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
