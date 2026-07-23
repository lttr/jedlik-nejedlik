// Resolve the session once on the server so the first paint reflects real auth
// state (no logged-out flash). `useState` serialises the result into the Nuxt
// payload, so the client reuses it without a second round-trip.
export default defineNuxtPlugin(async () => {
  const user = useAuthUser()
  if (!import.meta.server || user.value !== null) {
    return
  }

  try {
    const { user: resolved } = await useRequestFetch()("/api/auth/me")
    user.value = resolved
  } catch {
    // Leave the user anonymous if the session probe fails.
  }
})
