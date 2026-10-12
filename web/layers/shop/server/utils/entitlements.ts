import { readItems } from "@directus/sdk"

import { z } from "zod"

import { COURSE_PUBLIC_FIELDS } from "./course-query"
import { CourseSchema } from "#layers/directus/shared/utils/schemas"
import type { Course } from "#layers/directus/shared/utils/schemas"
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

export interface OwnedCourse {
  // The Entitlement's id, not the Course's: it is what the list is keyed by,
  // and a Student holds at most one Entitlement per Course anyway.
  entitlementId: number
  course: Course
}

// `course` is nullable on the wire even though the column is not: a Student
// may hold an Entitlement for a Course no longer readable to them, and
// Directus answers that with `null` rather than with a refusal.
const OwnedRowSchema = z.object({
  id: z.number(),
  course: CourseSchema.nullable(),
})

// An Entitlement whose Course is unreadable is dropped rather than rendered
// as a blank card. Newest Entitlement first, so a Course just bought is at
// the top.
export function parseOwnedCourses(rows: unknown): OwnedCourse[] {
  return z
    .array(OwnedRowSchema)
    .parse(rows)
    .flatMap(({ id, course }) => (course === null ? [] : [{ entitlementId: id, course }]))
    .toSorted((a, b) => b.entitlementId - a.entitlementId)
}
