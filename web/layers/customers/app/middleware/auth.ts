// Named middleware — opt in with `definePageMeta({ middleware: "auth" })`.
//
// This is a UX affordance, not a security boundary: it keeps signed-out
// visitors off pages that would render empty. Access to anything paid is
// enforced server-side by `requireUserSession` in the route handlers and by
// Directus's own row-level policies (R-5).
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()
  if (loggedIn.value) {
    return
  }

  return navigateTo({ path: LOGIN_PATH, query: { next: to.fullPath } })
})
