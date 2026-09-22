import { readItems } from "@directus/sdk"
import type { QueryFields } from "@directus/sdk"

import type { CourseCollection, Schema } from "../../../directus/shared/types/directus"
import { CourseStatusSchema } from "../../../directus/shared/utils/schemas"

// What the two shop routes ask Directus for. Server-only: this is Directus
// query syntax, of no use to the Vue app, so it lives next to the routes
// rather than in `shared/`.

// The Course columns both routes select. Kept in one place: `CourseSchema`
// gaining a column has to reach the Catalog and the Sales Page together, or
// whichever route was forgotten throws at parse time. `status` is not here —
// only the Catalog renders it (the „Koncept" badge), and it adds the column
// to its own selection.
export const COURSE_PUBLIC_FIELDS = [
  "id",
  "sort",
  "title",
  "slug",
  "description",
  "price_czk",
  { cover: ["id", "width", "height", "description"] },
] as const

// The statuses the shop asks Directus for (spec, "Scope of the Catalog"),
// spread out of `CourseStatusSchema` so the filter and the parsers stay the
// same list. Asking for `draft` is safe: the public policy filters on
// published, so a draft only ever comes back for an Author's own token
// (ADR 0004). The Catalog and the Sales Page routes share this one list, so a
// visitor cannot reach through one what the other hides. Spread rather than
// passed straight through: the SDK's `_in` takes a mutable `string[]` and
// rejects Zod's readonly tuple.
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

// One Course by slug for the whole shop — the Sales Page and the Checkout —
// read with the caller's own client, so who may see a draft is Directus's
// decision (ADR 0004) and absent is the shop's 404. Callers pick their own
// columns, checked against the schema by `QueryFields`; the status filter and
// the 404 are not theirs to change. The row comes back as `unknown` because
// every caller parses it with its own codec anyway, and a codec that trusts
// an inferred shape checks nothing.
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
