// Prototyp: klientská brána. Ostrá verze vynucuje přístup na serveru přes oprávnění
// Directu u každého chráněného obsahu (FP-5, TR-4) — skrytí ve frontendu není ochrana (R-5).
export default defineNuxtRouteMiddleware((to) => {
  const { student } = useLms()
  const authed = typeof student.value === "string" && student.value.length > 0
  return authed ? undefined : { path: "/kurzy/vstup", query: { redirect: to.fullPath } }
})
