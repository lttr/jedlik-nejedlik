// Resolves the logged-in Student once per page request, so SSR renders the
// header and any guarded page in its final state — no client-side refetch,
// no logged-out flicker. Asset and API requests are skipped: resolution
// costs a Directus round-trip, and API routes that need the identity ask for
// it themselves.
export default defineEventHandler(async (event) => {
  if (!isPageRequest(event.path)) {
    return
  }
  event.context.student = await readStudent(event)
})

function isPageRequest(path: string): boolean {
  const pathname = path.split("?")[0] ?? ""
  if (pathname.startsWith("/_") || pathname.startsWith("/api/")) {
    return false
  }
  return !/\.\w+$/.test(pathname)
}
