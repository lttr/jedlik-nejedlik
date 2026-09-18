// The Sales Page (spec, "Routes and navigation"). The caller's own session
// decides what Directus returns, so a draft is readable by its Author and
// absent for everyone else.
//
// The same session decides ownership: a Student who already holds an
// Entitlement for this Course is shown „Přejít do kurzu" instead of a buy
// button. The Service Account is never involved (ADR 0004) — it could read
// everyone's Entitlements, and this route only ever needs the caller's.
export default defineEventHandler(async (event): Promise<SalesView> => {
  const slug = getRouterParam(event, "slug") ?? ""
  // Held apart from the client below on purpose: a visitor has no session,
  // and the public policy grants no `entitlement` read at all, so asking
  // would be a refusal rather than an empty list.
  const session = await getAccountDirectusClient(event)
  const client = session ?? getDirectusAnonymousServerClient(event)

  const row = await readCourseBySlug(client, slug, [...COURSE_PUBLIC_FIELDS, COURSE_OUTLINE_FIELDS])
  const course = parseSalesCourse(row)

  return {
    course,
    entitled: session === null ? false : await holdsEntitlement(session, course.id),
  }
})
