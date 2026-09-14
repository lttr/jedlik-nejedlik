import { describe, expect, it } from "vitest"

import { parseSalesCourse } from "../../layers/shop/shared/utils/sales"

// A course row as Directus returns it for the Sales Page query: the public
// Course columns and the expanded outline. `status` rides along because the
// query filters on it; the codec drops it, the Sales Page shows no draft
// marker. Rows arrive in whatever order the database chose; the codec owns
// the outline order.
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

function lesson(id: number, sort: number | null, type: "video" | "text" = "video") {
  return { id, section: 1, title: `Lekce ${id}`, sort, type }
}

describe("parseSalesCourse", () => {
  it("keeps the hero fields and drops the status", () => {
    const course = parseSalesCourse(row())
    expect(course).toMatchObject({ id: 1, slug: "kurz", price_czk: 1490 })
    expect(course).not.toHaveProperty("status")
    expect(course.sections).toEqual([])
  })

  it("orders sections by sort, unsorted last, id as the tiebreaker", () => {
    const course = parseSalesCourse(
      row({
        sections: [
          { id: 3, course: 1, title: "Bez pořadí", sort: null, lessons: [] },
          { id: 2, course: 1, title: "Druhá", sort: 2, lessons: [] },
          { id: 1, course: 1, title: "První", sort: 1, lessons: [] },
        ],
      }),
    )
    expect(course.sections.map((section) => section.id)).toEqual([1, 2, 3])
  })

  it("orders the lessons of each section the same way", () => {
    const course = parseSalesCourse(
      row({
        sections: [
          {
            id: 1,
            course: 1,
            title: "Sekce",
            sort: 1,
            lessons: [lesson(6, null, "text"), lesson(5, 2), lesson(4, 1)],
          },
        ],
      }),
    )
    expect(course.sections[0]?.lessons.map((item) => item.id)).toEqual([4, 5, 6])
    expect(course.sections[0]?.lessons[2]?.type).toBe("text")
  })

  it("rejects a lesson of an unknown type", () => {
    expect(() =>
      parseSalesCourse(
        row({
          sections: [
            {
              id: 1,
              course: 1,
              title: "Sekce",
              sort: 1,
              lessons: [lesson(1, 1, "quiz" as "video")],
            },
          ],
        }),
      ),
    ).toThrow(/Invalid option/)
  })
})
