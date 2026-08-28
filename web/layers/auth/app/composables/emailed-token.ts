export interface EmailedToken {
  // The `?token=` value, captured during setup — before the address bar was
  // cleaned, and unaffected by cleaning it.
  token: string
  // Resolves once the scrub has run. Anything that acts on the token on mount
  // waits for this first, so the token is out of the URL either way.
  scrubbed: Promise<void>
}

// The recipe both pages reached from an e-mailed link share: `/overeni-emailu`
// and `/obnova-hesla` each arrive with a one-shot secret in the query string.
// Read it, then get it out of the address bar before anything else happens —
// it must not survive in a history entry, a bookmark, or a referrer. Clearing
// it up front rather than after the request means a dead or expired token is
// not left lying around either.
//
// The replacing router navigation is `history.replaceState` with the router
// kept in step. It runs on mount, so SSR still sees the token and the page can
// decide from it what to render without a hydration mismatch. The current
// route is its own target — the page never has to name its own path.
export function useEmailedToken(): EmailedToken {
  const route = useRoute()
  const token = String(route.query.token ?? "")

  const scrubbed = new Promise<void>((resolve) => {
    onMounted(async () => {
      try {
        // Nothing to scrub when the page was opened by hand rather than from
        // an e-mail, and a router navigation is not free.
        if (token !== "") {
          await navigateTo({ path: route.path, query: {} }, { replace: true })
        }
      } finally {
        // A failed scrub must not strand the page waiting: the caller still
        // has the token and its own error handling.
        resolve()
      }
    })
  })

  return { token, scrubbed }
}
