import { describe, expect, it } from "vitest"

import { parseOwnedCourses } from "#layers/shop/shared/utils/owned-courses"

// An entitlement row as Directus returns it for „Moje kurzy": the
// Entitlement's id and the Course expanded to the public columns. `course` is
// null when the Student may no longer read it — a Course turned back into a
// draft, or archived.
function row(id: number, course: Record<string, unknown> | null = {}): unknown {
  return {
    id,
    course:
      course === null
        ? null
        : {
            id: 10 + id,
            sort: null,
            title: `Kurz ${id}`,
            slug: `kurz-${id}`,
            description: null,
            cover: null,
            price_czk: 1490,
            ...course,
          },
  }
}

describe("parseOwnedCourses", () => {
  it("keeps the entitlement id next to its course", () => {
    expect(parseOwnedCourses([row(1)])).toMatchObject([
      { entitlementId: 1, course: { id: 11, title: "Kurz 1", slug: "kurz-1" } },
    ])
  })

  it("normalises the course's nulls the way the catalog does", () => {
    const [owned] = parseOwnedCourses([row(1, { description: null, cover: null, price_czk: null })])
    expect(owned.course.description).toBeUndefined()
    expect(owned.course.cover).toBeUndefined()
    expect(owned.course.price_czk).toBeUndefined()
  })

  it("keeps a cover when there is one", () => {
    const cover = { id: "abc", width: 1600, height: 900, description: null }
    const [owned] = parseOwnedCourses([row(1, { cover })])
    expect(owned.course.cover).toMatchObject({ id: "abc", width: 1600, height: 900 })
  })

  it("drops an entitlement whose course is no longer readable", () => {
    expect(parseOwnedCourses([row(1), row(2, null)])).toMatchObject([{ entitlementId: 1 }])
  })

  it("puts the newest entitlement first", () => {
    expect(parseOwnedCourses([row(2), row(7), row(5)]).map((owned) => owned.entitlementId)).toEqual(
      [7, 5, 2],
    )
  })

  it("answers an empty list with an empty list", () => {
    expect(parseOwnedCourses([])).toEqual([])
  })
})
