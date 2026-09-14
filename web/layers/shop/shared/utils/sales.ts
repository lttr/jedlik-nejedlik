import { z } from "zod"

import { CourseSchema, LessonSchema, SectionSchema } from "../../../directus/shared/utils/schemas"
import type { Course, Lesson, Section } from "../../../directus/shared/utils/schemas"
import { compareCatalogOrder } from "./catalog-order"

// What the Sales Page route returns: the public Course shape, its status
// (an Author's own token returns drafts, ADR 0004) and the full outline in
// display order. Lesson bodies and videos are not part of it; the outline
// is what a visitor may read before buying.
export interface SalesSection extends Section {
  lessons: Lesson[]
}

export interface SalesCourse extends Course {
  status: "published" | "draft"
  sections: SalesSection[]
}

const SalesExtrasSchema = z.object({
  status: z.enum(["published", "draft"]),
  sections: z.array(SectionSchema.and(z.object({ lessons: z.array(LessonSchema) }))),
})

// The outline order is the codec's job, not the database's: Sections and
// Lessons follow the Catalog rule (`sort` ascending, unsorted last, `id` as
// the tiebreaker) whatever order Directus returned them in.
export function parseSalesCourse(raw: unknown): SalesCourse {
  const course = CourseSchema.parse(raw)
  const { status, sections } = SalesExtrasSchema.parse(raw)
  const ordered = sections.toSorted(compareCatalogOrder)
  // In place: the sections are the codec's own fresh objects, nobody else
  // holds them yet.
  for (const section of ordered) {
    section.lessons.sort(compareCatalogOrder)
  }
  return { ...course, status, sections: ordered }
}
