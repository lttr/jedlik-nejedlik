export interface EmailedToken {
  // The `?token=` value, captured during setup, before the URL is cleaned.
  token: string
  // Resolves once the token is out of the URL; act on the token after it.
  scrubbed: Promise<void>
}

// Both pages reached from an e-mailed link arrive with a one-shot secret in
// the query. Read it, then get it out of the address bar before anything else
// happens: it must not survive in history, a bookmark or a referrer. Scrubbed
// on mount, not in setup, so SSR still sees the token and there is no
// hydration mismatch.
export function useEmailedToken(): EmailedToken {
  const route = useRoute()
  const token = String(route.query.token ?? "")

  const scrubbed = new Promise<void>((resolve) => {
    onMounted(async () => {
      try {
        // Nothing to scrub when the page was opened by hand.
        if (token !== "") {
          await navigateTo({ path: route.path, query: {} }, { replace: true })
        }
      } finally {
        // A failed scrub must not strand the page waiting.
        resolve()
      }
    })
  })

  return { token, scrubbed }
}
