import { readItems } from "@directus/sdk"

// The Catalog (spec, "Scope of the Catalog"): every Course in a shop
// status, in the Author's order.
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
      filter: { status: { _in: SHOP_COURSE_STATUSES } },
      // Directus orders the same way, so the payload arrives sorted; the
      // comparator is still applied because null placement is the
      // database's choice there, not ours.
      sort: ["sort", "id"],
      limit: -1,
    }),
  )
  return rows.map((row) => parseCatalogCourse(row)).toSorted(compareCatalogOrder)
})
