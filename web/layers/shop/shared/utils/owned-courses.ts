import { z } from "zod"

import { CourseSchema } from "../../../directus/shared/utils/schemas"
import type { Course } from "../../../directus/shared/utils/schemas"

// „Moje kurzy": the Courses a Student holds an Entitlement for. Shared,
// because the Nitro route produces it and the Account page's component renders
// it, and neither should have to guess the other's shape.

// The Sales Page sends an owner straight to the section rather than to the top
// of the Account page, so one constant per thing keeps the link and the
// heading's `id` from drifting apart.
export const MY_COURSES_PATH = "/muj-ucet"
export const MY_COURSES_ANCHOR = "moje-kurzy"

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
