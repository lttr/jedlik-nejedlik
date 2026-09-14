import { describe, expect, it } from "vitest"

import { compareCatalogOrder } from "../../layers/shop/shared/utils/catalog-order"

// Only the keys the comparator reads; a course carries more.
interface Row {
  id: number
  sort?: number
}

function ids(rows: Row[]): number[] {
  return rows.toSorted(compareCatalogOrder).map((row) => row.id)
}

describe("compareCatalogOrder", () => {
  it("orders by sort ascending", () => {
    expect(
      ids([
        { id: 1, sort: 20 },
        { id: 2, sort: 10 },
      ]),
    ).toEqual([2, 1])
  })

  it("puts a course without sort after every sorted one", () => {
    expect(ids([{ id: 1 }, { id: 2, sort: 1000 }, { id: 3, sort: 5 }])).toEqual([3, 2, 1])
  })

  it("breaks a sort tie by id ascending", () => {
    expect(
      ids([
        { id: 9, sort: 1 },
        { id: 4, sort: 1 },
      ]),
    ).toEqual([4, 9])
  })

  it("orders courses without sort by id ascending", () => {
    expect(ids([{ id: 7 }, { id: 3 }])).toEqual([3, 7])
  })
})
