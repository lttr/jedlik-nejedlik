import { z } from "zod"

import { CourseSchema, CourseStatusSchema } from "../../../directus/shared/utils/schemas"
import type { Course, CourseStatus } from "../../../directus/shared/utils/schemas"

// What the Catalog route returns per Course: the public Course shape plus
// its status (an Author's own token returns drafts, ADR 0004, and the card
// marks them „Koncept") and the Lesson count the card shows.
export interface CatalogCourse extends Course {
  status: CourseStatus
  lessonCount: number
}

// The columns the Catalog query expands beyond `CourseSchema`. Lessons are
// fetched as bare ids (`sections.lessons.id`), the cheapest shape the SDK
// offers for a count in the same request as the course.
const CatalogRowSchema = CourseSchema.and(
  z.object({
    status: CourseStatusSchema,
    sections: z.array(z.object({ lessons: z.array(z.object({ id: z.number() })) })),
  }),
)

export function parseCatalogCourse(raw: unknown): CatalogCourse {
  const { sections, ...course } = CatalogRowSchema.parse(raw)
  return { ...course, lessonCount: sections.flatMap((section) => section.lessons).length }
}
