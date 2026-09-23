import { z } from "zod"

import { CourseSchema, LessonSchema, SectionSchema } from "#layers/directus/shared/utils/schemas"
import type { Course, Lesson, Section } from "#layers/directus/shared/utils/schemas"
import { compareCatalogOrder } from "./catalog-order"

// The outline a visitor may read before buying: no Lesson bodies or videos,
// and no status — the route's filter already decides whether a draft is
// readable at all (ADR 0004).
export interface SalesSection extends Section {
  lessons: Lesson[]
}

export interface SalesCourse extends Course {
  sections: SalesSection[]
}

// `entitled` is the caller's own Entitlement, read with their own session
// (ADR 0004): it decides whether the button reads „Koupit kurz" or „Přejít do
// kurzu", and is always `false` for a visitor.
export interface SalesView {
  course: SalesCourse
  entitled: boolean
}

const SalesRowSchema = CourseSchema.and(
  z.object({
    sections: z.array(SectionSchema.and(z.object({ lessons: z.array(LessonSchema) }))),
  }),
)

// The outline order is the codec's job, not the database's: Sections and
// Lessons follow the Catalog rule (`sort` ascending, unsorted last, `id` as
// the tiebreaker) whatever order Directus returned them in.
export function parseSalesCourse(raw: unknown): SalesCourse {
  const { sections, ...course } = SalesRowSchema.parse(raw)
  const ordered = sections.toSorted(compareCatalogOrder)
  // In place: the sections are the codec's own fresh objects, nobody else
  // holds them yet.
  for (const section of ordered) {
    section.lessons.sort(compareCatalogOrder)
  }
  return { ...course, sections: ordered }
}
