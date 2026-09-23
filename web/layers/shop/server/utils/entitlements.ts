import { readItems } from "@directus/sdk"

import { parseOwnedCourses } from "#layers/shop/shared/utils/owned-courses"
import type { OwnedCourse } from "#layers/shop/shared/utils/owned-courses"
import { COURSE_PUBLIC_FIELDS } from "./course-query"
import type { DirectusRestClient } from "#layers/directus/shared/utils/directus"

// Every read of „what does this caller own", always on the caller's own
// session (ADR 0004): the Student policy filters `entitlement` to
// `$CURRENT_USER`, so no route has to remember a filter.

export async function holdsEntitlement(
  client: DirectusRestClient,
  courseId: number,
): Promise<boolean> {
  const held = await client.request(
    readItems("entitlement", { fields: ["id"], filter: { course: { _eq: courseId } }, limit: 1 }),
  )
  return held.length > 0
}

export async function readOwnedCourses(client: DirectusRestClient): Promise<OwnedCourse[]> {
  const rows = await client.request(
    readItems("entitlement", {
      fields: ["id", { course: [...COURSE_PUBLIC_FIELDS] }],
      limit: -1,
    }),
  )
  return parseOwnedCourses(rows)
}
