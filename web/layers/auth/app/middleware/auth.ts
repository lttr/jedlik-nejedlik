// Opt-in per page via `definePageMeta({ middleware: "auth" })`. UX only —
// what a Student may actually read stays enforced by Directus permissions
// and by the session checks in the Nitro routes (R-5).
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useStudent()
  if (loggedIn.value) {
    return
  }
  return navigateTo({ path: "/prihlaseni", query: { redirect: to.fullPath } })
})
