import { useAccount } from "../composables/account"
import { safeRedirectPath } from "#layers/auth/shared/utils/redirects"

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useAccount()
  if (!loggedIn.value) {
    return
  }
  return navigateTo(safeRedirectPath(to.query.redirect), { replace: true })
})
