// Resolves the logged-in Student once per page request, so SSR renders the
// header and any guarded page in its final state — no client-side refetch,
// no logged-out flicker.
import type { H3Event } from "h3"

export default defineEventHandler(async (event) => {
  if (!isPageRequest(event)) {
    return
  }
  event.context.student = await readStudent(event)
})

// Resolution costs a Directus round-trip, so it is limited to requests that
// actually render a page: asset and API requests are skipped, and API routes
// that need the identity ask for it themselves. The Accept header is what
// separates a navigation from an asset fetch — sniffing for a file extension
// would misjudge any page slug containing a dot.
function isPageRequest(event: H3Event): boolean {
  if (event.path.startsWith("/_") || event.path.startsWith("/api/")) {
    return false
  }
  return getHeader(event, "accept")?.includes("text/html") ?? false
}
