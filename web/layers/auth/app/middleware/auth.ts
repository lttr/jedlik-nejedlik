// Opt-in via `definePageMeta({ middleware: "auth" })`. UX only: what a Student
// may read stays enforced by Directus permissions and the Nitro routes (R-5).
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useStudent()
  if (loggedIn.value) {
    return
  }
  return navigateTo({ path: "/prihlaseni", query: { redirect: to.fullPath } })
})
