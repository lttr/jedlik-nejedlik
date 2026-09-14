// A logged-in Account has no business on the login form; send them on.
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useAccount()
  if (!loggedIn.value) {
    return
  }
  return navigateTo(safeRedirectPath(to.query.redirect), { replace: true })
})
