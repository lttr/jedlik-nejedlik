import { z } from "zod"

import { CourseSchema } from "../../../directus/shared/utils/schemas"
import type { Course } from "../../../directus/shared/utils/schemas"

// What the Catalog route returns per Course: the public Course shape plus
// its status (an Author's own token returns drafts, ADR 0004, and the card
// marks them „Koncept") and the Lesson count the card shows.
export interface CatalogCourse extends Course {
  status: "published" | "draft"
  lessonCount: number
}

// The columns the Catalog query expands beyond `CourseSchema`. Lessons are
// fetched as bare ids (`sections.lessons.id`), the cheapest shape the SDK
// offers for a count in the same request as the course.
const CatalogExtrasSchema = z.object({
  status: z.enum(["published", "draft"]),
  sections: z.array(z.object({ lessons: z.array(z.object({ id: z.number() })) })),
})

export function parseCatalogCourse(raw: unknown): CatalogCourse {
  const course = CourseSchema.parse(raw)
  const { status, sections } = CatalogExtrasSchema.parse(raw)
  return { ...course, status, lessonCount: sections.flatMap((section) => section.lessons).length }
}
