// The mirror of `auth`: a Student who is already logged in has no business on
// the login form, so send them where they were heading.
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useStudent()
  if (!loggedIn.value) {
    return
  }
  return navigateTo(safeRedirectPath(to.query.redirect), { replace: true })
})
