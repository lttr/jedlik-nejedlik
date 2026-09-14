import { readItems } from "@directus/sdk"

// The Catalog (spec, "Scope of the Catalog"). An explicit status list rather
// than every row: `published` is what a visitor may read anyway, and `draft`
// only ever comes back for an Author's own token, because the public policy
// filters on published (ADR 0004). Any status added later (archived, a Live
// Course marker) stays out of the shop until someone lists it here.
const CATALOG_STATUSES = ["published", "draft"]

export default defineEventHandler(async (event): Promise<CatalogCourse[]> => {
  const client = await getCallerDirectusClient(event)
  const rows = await client.request(
    readItems("course", {
      fields: [
        "id",
        "status",
        "sort",
        "title",
        "slug",
        "description",
        "price_czk",
        { cover: ["id", "width", "height", "description"] },
        { sections: [{ lessons: ["id"] }] },
      ],
      filter: { status: { _in: CATALOG_STATUSES } },
      // Directus orders the same way, so the payload arrives sorted; the
      // comparator is still applied because null placement is the
      // database's choice there, not ours.
      sort: ["sort", "id"],
      limit: -1,
    }),
  )
  return rows.map((row) => parseCatalogCourse(row)).toSorted(compareCatalogOrder)
})
