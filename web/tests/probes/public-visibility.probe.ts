import { describe, expect, it } from "vitest"
import { probe } from "./support"

// Anonymous (public role) visibility matrix for the Kurzy collections.
// Relies on the [TEST]-marked seed data on the production instance (one
// published and one draft course, each with a section and lessons; the
// published video lesson carries a Material). See
// .aiwork/2026-07-22_directus-data-model/implementation-notes.md.

const PUBLISHED_SLUG = "test-kurz-publikovany"
const DRAFT_SLUG = "test-kurz-draft"

function items(response: { body: { data?: unknown } }): Record<string, unknown>[] {
  expect(Array.isArray(response.body.data)).toBe(true)
  return response.body.data as Record<string, unknown>[]
}

describe("anonymous course visibility", () => {
  it("lists only published courses, with sales fields", async () => {
    const response = await probe("/items/course?fields=id,status,title,slug,price_czk&limit=-1")
    expect(response.status).toBe(200)
    const courses = items(response)
    expect(courses.length).toBeGreaterThan(0)
    for (const course of courses) {
      expect(course.status).toBe("published")
    }
    const slugs = courses.map((course) => course.slug)
    expect(slugs).toContain(PUBLISHED_SLUG)
    expect(slugs).not.toContain(DRAFT_SLUG)
  })

  it("returns nothing for a draft course filtered by slug", async () => {
    const response = await probe(`/items/course?filter[slug][_eq]=${DRAFT_SLUG}`)
    expect(response.status).toBe(200)
    expect(items(response)).toHaveLength(0)
  })

  it("denies non-public course fields (test_pass_threshold)", async () => {
    const response = await probe("/items/course?fields=test_pass_threshold")
    expect(response.status).toBe(403)
    expect(response.body.errors?.[0]?.extensions?.code).toBe("FORBIDDEN")
  })
})

describe("anonymous outline visibility", () => {
  it("reads the section outline (title, sort, course id)", async () => {
    const response = await probe("/items/section?fields=id,course,title,sort&limit=-1")
    expect(response.status).toBe(200)
    expect(items(response).length).toBeGreaterThan(0)
  })

  it("denies section unlock configuration", async () => {
    const response = await probe("/items/section?fields=unlock_rule")
    expect(response.status).toBe(403)
  })

  it("reads the lesson outline (title, sort, type, section id)", async () => {
    const response = await probe("/items/lesson?fields=id,section,title,sort,type&limit=-1")
    expect(response.status).toBe(200)
    const lessons = items(response)
    expect(lessons.length).toBeGreaterThan(0)
    for (const lesson of lessons) {
      expect(["video", "text"]).toContain(lesson.type)
    }
  })

  it("reads the nested outline of a published course", async () => {
    const response = await probe(
      `/items/course?filter[slug][_eq]=${PUBLISHED_SLUG}` +
        "&fields=title,sections.title,sections.lessons.title,sections.lessons.type",
    )
    expect(response.status).toBe(200)
    const [course] = items(response)
    const sections = course.sections as { lessons: unknown[] }[]
    expect(sections.length).toBeGreaterThan(0)
    expect(sections[0].lessons.length).toBeGreaterThan(0)
  })

  it("hides the outline of draft courses", async () => {
    // Sections/lessons are readable only through a published parent course,
    // so the seeded draft course contributes no rows at all.
    const sections = await probe("/items/section?fields=id,course.slug&limit=-1")
    for (const section of items(sections)) {
      expect((section.course as { slug: string }).slug).not.toBe(DRAFT_SLUG)
    }
  })
})

describe("anonymous denial of paid lesson content", () => {
  it("denies lesson.body", async () => {
    const response = await probe("/items/lesson?fields=body")
    expect(response.status).toBe(403)
    expect(response.body.errors?.[0]?.extensions?.code).toBe("FORBIDDEN")
  })

  it("denies lesson.video_uid", async () => {
    const response = await probe("/items/lesson?fields=video_uid")
    expect(response.status).toBe(403)
  })

  it("denies paid fields through the course tree", async () => {
    const response = await probe("/items/course?fields=sections.lessons.body")
    expect(response.status).toBe(403)
  })

  it("keeps paid fields out of the default lesson shape", async () => {
    const response = await probe("/items/lesson?limit=-1")
    expect(response.status).toBe(200)
    for (const lesson of items(response)) {
      expect(lesson).not.toHaveProperty("body")
      expect(lesson).not.toHaveProperty("video_uid")
      expect(lesson).not.toHaveProperty("materials")
    }
  })

  it("denies the Materials junction collection", async () => {
    const response = await probe("/items/lesson_material")
    expect(response.status).toBe(403)
  })

  it("never expands Materials, even when a junction row exists", async () => {
    const response = await probe("/items/lesson?fields=id,materials.directus_files_id&limit=-1")
    expect(response.status).toBe(200)
    for (const lesson of items(response)) {
      expect(lesson).not.toHaveProperty("materials")
    }
  })
})
