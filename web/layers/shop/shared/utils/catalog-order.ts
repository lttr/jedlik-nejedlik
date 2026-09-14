// Catalog order (spec, "Read path"): `sort` ascending, a course with no
// `sort` after every sorted one, `id` ascending as the tiebreaker. `sort` is
// nullable and older rows have it unset, so without the null rule the
// Author's ordering would depend on the database's null placement.
export interface CatalogOrderKeys {
  id: number
  sort?: number
}

export function compareCatalogOrder(a: CatalogOrderKeys, b: CatalogOrderKeys): number {
  const bySort = (a.sort ?? Number.POSITIVE_INFINITY) - (b.sort ?? Number.POSITIVE_INFINITY)
  // Infinity - Infinity is NaN, which is the "both unset" tie.
  if (Number.isNaN(bySort) || bySort === 0) {
    return a.id - b.id
  }
  return bySort
}
