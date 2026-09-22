import { readItems } from "@directus/sdk"

import { parseOwnedCourses } from "../../shared/utils/owned-courses"
import type { OwnedCourse } from "../../shared/utils/owned-courses"

// Every read of „what does this caller own". Always with the caller's own
// session (ADR 0004): the Student policy filters `entitlement` to
// `$CURRENT_USER`, so ownership is Directus's decision and no route has to
// remember to add a filter. The Shop Service Account is never used here — it
// can read every Entitlement there is.

export async function holdsEntitlement(
  client: DirectusRestClient,
  courseId: number,
): Promise<boolean> {
  const held = await client.request(
    readItems("entitlement", { fields: ["id"], filter: { course: { _eq: courseId } }, limit: 1 }),
  )
  return held.length > 0
}

// The Course columns are the Catalog's, so a cover and a title arrive the
// same way they do on a Catalog card.
export async function readOwnedCourses(client: DirectusRestClient): Promise<OwnedCourse[]> {
  const rows = await client.request(
    readItems("entitlement", {
      fields: ["id", { course: [...COURSE_PUBLIC_FIELDS] }],
      limit: -1,
    }),
  )
  return parseOwnedCourses(rows)
}
