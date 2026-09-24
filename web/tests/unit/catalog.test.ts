import { describe, expect, it } from "vitest"

import { parseCatalogCourse } from "#layers/shop/shared/utils/catalog"

// A course row as Directus returns it for the Catalog query: the public
// Course columns, `status`, and the outline collapsed to bare lesson ids.
// Unlike the Sales Page codec, this one must *keep* `status` — the card's
// „Koncept" badge is the only thing that reads it.
function row(overrides: Record<string, unknown> = {}): unknown {
  return {
    id: 1,
    status: "published",
    sort: null,
    title: "Kurz",
    slug: "kurz",
    description: null,
    cover: null,
    price_czk: 1490,
    sections: [],
    ...overrides,
  }
}

describe("parseCatalogCourse", () => {
  it("keeps the hero fields and the status", () => {
    const course = parseCatalogCourse(row({ status: "draft" }))
    expect(course).toMatchObject({ id: 1, slug: "kurz", price_czk: 1490, status: "draft" })
  })

  it("normalises the nullable columns to undefined", () => {
    const course = parseCatalogCourse(row())
    expect(course.description).toBeUndefined()
    expect(course.cover).toBeUndefined()
    expect(course.sort).toBeUndefined()
  })

  it("carries the cover through with its nulls normalised", () => {
    const course = parseCatalogCourse(
      row({ cover: { id: "f1", width: 1200, height: 675, description: null } }),
    )
    expect(course.cover).toEqual({ id: "f1", width: 1200, height: 675 })
  })

  it("counts the lessons of every section", () => {
    const course = parseCatalogCourse(
      row({
        sections: [{ lessons: [{ id: 1 }, { id: 2 }] }, { lessons: [] }, { lessons: [{ id: 3 }] }],
      }),
    )
    expect(course.lessonCount).toBe(3)
  })

  it("counts no lessons for a course with no sections", () => {
    expect(parseCatalogCourse(row()).lessonCount).toBe(0)
  })

  it("rejects a status the shop does not deal in", () => {
    expect(() => parseCatalogCourse(row({ status: "archived" }))).toThrow(/Invalid option/)
  })
})
