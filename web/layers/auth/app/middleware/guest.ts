// A logged-in Student has no business on the login form; send them on.
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useStudent()
  if (!loggedIn.value) {
    return
  }
  return navigateTo(safeRedirectPath(to.query.redirect), { replace: true })
})
