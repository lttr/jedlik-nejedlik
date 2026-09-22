export interface EmailedToken {
  token: string
  // Resolves once the token is out of the URL; act on the token after it.
  scrubbed: Promise<void>
}

// The one-shot `?token=` must not survive in history or a referrer, so it is
// scrubbed from the URL on mount (not in setup, to avoid a hydration mismatch).
export function useEmailedToken(): EmailedToken {
  const route = useRoute()
  const token = String(route.query.token ?? "")

  const scrubbed = new Promise<void>((resolve) => {
    onMounted(async () => {
      try {
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
