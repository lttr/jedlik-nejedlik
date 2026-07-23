import type { RouteMiddleware } from "#app"

// Opt-in guard for member pages: `definePageMeta({ middleware: "auth" })`.
// Anonymous visitors are bounced to login with a return path.
export default defineNuxtRouteMiddleware((to): ReturnType<RouteMiddleware> => {
  if (useAuthUser().value === null) {
    return navigateTo({ path: "/prihlaseni", query: { redirect: to.fullPath } })
  }
})
