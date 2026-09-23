import { getAccountDirectusClient } from "#layers/auth/server/utils/account-session"
import { getDirectusAnonymousServerClient } from "#layers/directus/server/utils/directus-server"
import {
  COURSE_OUTLINE_FIELDS,
  COURSE_PUBLIC_FIELDS,
  readCourseBySlug,
} from "#layers/shop/server/utils/course-query"
import { holdsEntitlement } from "#layers/shop/server/utils/entitlements"
import { parseSalesCourse } from "#layers/shop/shared/utils/sales"
import type { SalesView } from "#layers/shop/shared/utils/sales"

// The Sales Page. The caller's own session decides both what Directus returns
// — a draft is readable by its Author, absent for everyone else — and whether
// the Student is entitled (ADR 0004).
// See docs/shop.md, „Catalog read path“.
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
