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
// spread out of the codec so the filter and the parsers are the same list.
// `published` is what a visitor may read anyway; `draft` only ever comes back
// for an Author's own token, because the public policy filters on published
// (ADR 0004). Shared by the Catalog and the Sales Page routes so a visitor
// cannot reach through one what the other hides. Spread rather than passed
// straight through: the SDK's `_in` takes a mutable `string[]` and rejects
// Zod's readonly tuple.
export const SHOP_COURSE_STATUSES = [...CourseStatusSchema.options]
