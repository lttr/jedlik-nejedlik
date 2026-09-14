// Catalog order (spec, "Read path"): `sort` ascending, a course with no
// `sort` after every sorted one, `id` ascending as the tiebreaker. `sort` is
// nullable and older rows have it unset, so without the null rule the
// Author's ordering would depend on the database's null placement.
export interface CatalogOrderKeys {
  id: number
  sort?: number
}

export function compareCatalogOrder(a: CatalogOrderKeys, b: CatalogOrderKeys): number {
  const aSort = a.sort ?? Number.POSITIVE_INFINITY
  const bSort = b.sort ?? Number.POSITIVE_INFINITY
  return aSort === bSort ? a.id - b.id : aSort - bSort
}
