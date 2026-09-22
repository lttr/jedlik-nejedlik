import { readItems } from "@directus/sdk"
import type { QueryFields } from "@directus/sdk"

import type { CourseCollection, Schema } from "../../../directus/shared/types/directus"
import { CourseStatusSchema } from "../../../directus/shared/utils/schemas"

// What the two shop routes ask Directus for. Server-only: this is Directus
// query syntax, of no use to the Vue app, so it lives next to the routes
// rather than in `shared/`.

// The Course columns both routes select, in one place so that a new column
// reaches the Catalog and the Sales Page together.
// See docs/shop.md, „Catalog read path“.
export const COURSE_PUBLIC_FIELDS = [
  "id",
  "sort",
  "title",
  "slug",
  "description",
  "price_czk",
  { cover: ["id", "width", "height", "description"] },
] as const

// The statuses the shop asks Directus for, spread out of `CourseStatusSchema`
// so the filter and the parsers stay the same list.
// See docs/shop.md, „Catalog read path“.
export const SHOP_COURSE_STATUSES = [...CourseStatusSchema.options]

// The Sales Page's extra selection: the outline, which is what a visitor may
// read before buying.
export const COURSE_OUTLINE_FIELDS = {
  sections: [
    "id",
    "course",
    "title",
    "sort",
    { lessons: ["id", "section", "title", "sort", "type"] },
  ],
} as const

// One Course by slug for the whole shop, read with the caller's own client, so
// who may see a draft is Directus's decision (ADR 0004) and absent is the
// shop's 404. See docs/shop.md, „Catalog read path“.
export async function readCourseBySlug(
  client: DirectusRestClient,
  slug: string,
  fields: QueryFields<Schema, CourseCollection>,
): Promise<unknown> {
  return readOnlyRow(
    client,
    readItems("course", {
      fields,
      filter: { status: { _in: SHOP_COURSE_STATUSES }, slug: { _eq: slug } },
      limit: 1,
    }),
  )
}
