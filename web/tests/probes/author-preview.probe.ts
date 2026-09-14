import { describe, expect, it } from "vitest"
import {
  COVER_FILE_ID,
  DRAFT_SLUG,
  PUBLISHED_SLUG,
  errorCode,
  item,
  items,
  nonEmptyItems,
  probe,
  roleToken,
} from "./support"

// Draft preview (spec, user stories 19, 20, 30): the shop pages read Directus
// with the caller's own session and add no status logic of their own
// (ADR 0004), so this is where "who sees a draft" is decided. An Author
// reads a draft Course and its outline; a Student and an anonymous visitor
// get the same answer as for a slug that never existed. Relies on the
// [TEST]-marked draft fixture course (one section, one text lesson).
//
// Required environment (static tokens of the fixture users, never committed):
//   DIRECTUS_PROBE_AUTHOR_TOKEN             probe-author@jedlik-nejedlik.cz (Autor)
//   DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN   probe-student-entitled@jedlik-nejedlik.cz
//   DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN probe-student-unentitled@jedlik-nejedlik.cz

const AUTHOR = roleToken("DIRECTUS_PROBE_AUTHOR_TOKEN")
const ENTITLED = roleToken("DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN")
const UNENTITLED = roleToken("DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN")

// The three reads the Sales Page needs for a draft: the Course by slug and
// its Sections and Lessons through the Course relation.
function ofDraft(collection: string, slugPath: string, fields: string): string {
  return `/items/${collection}?filter${slugPath}[_eq]=${DRAFT_SLUG}&fields=${fields}`
}
const DRAFT_COURSE = ofDraft("course", "[slug]", "id,status,slug")
const DRAFT_SECTIONS = ofDraft("section", "[course][slug]", "id,course")
const DRAFT_LESSONS = ofDraft("lesson", "[section][course][slug]", "id,section")
const DRAFT_NESTED = ofDraft("course", "[slug]", "slug,sections.id,sections.lessons.id")

describe("author draft preview", () => {
  it("reads the draft course by slug", async () => {
    const [course] = nonEmptyItems(await probe(DRAFT_COURSE, AUTHOR))
    expect(course.slug).toBe(DRAFT_SLUG)
    expect(course.status).toBe("draft")
  })

  it("reads the draft course's outline", async () => {
    nonEmptyItems(await probe(DRAFT_SECTIONS, AUTHOR))
    nonEmptyItems(await probe(DRAFT_LESSONS, AUTHOR))
  })

  it("reads the draft outline nested under the course", async () => {
    // The shape the Sales Page route actually asks for.
    const [course] = nonEmptyItems(await probe(DRAFT_NESTED, AUTHOR))
    const sections = course.sections as { lessons: unknown[] }[]
    expect(sections.flatMap((section) => section.lessons)).not.toHaveLength(0)
  })
})

// Directus filters drafts out rather than refusing the request: the observed
// answer is 200 with an empty list and no error, indistinguishable from a
// slug that does not exist. The Sales Page turns that into its 404. Should a
// policy change ever make this a 403, the error-code assertion catches it.
describe.each([
  ["a Student with an entitlement", ENTITLED],
  ["a Student without one", UNENTITLED],
  ["an anonymous visitor", undefined],
])("draft preview is hidden from %s", (_who, token) => {
  it.each([
    ["the course", DRAFT_COURSE],
    ["its sections", DRAFT_SECTIONS],
    ["its lessons", DRAFT_LESSONS],
  ])("answers an empty list for %s", async (_what, path) => {
    const response = await probe(path, token)
    expect(response.status).toBe(200)
    expect(errorCode(response)).toBeUndefined()
    expect(items(response)).toHaveLength(0)
  })
})

// The Public policy does not apply to a session, so Student and Autor each
// carry their own copy of its file rule. Without it Directus refuses the
// `description` field and both shop routes 500 (user story 25).
const COVER_FIELDS = "id,width,height,description"
const PUBLISHED_COVER =
  `/items/course?filter[slug][_eq]=${PUBLISHED_SLUG}` +
  `&fields=slug,cover.id,cover.width,cover.height,cover.description`

describe.each([
  ["an Author", AUTHOR],
  ["a Student with an entitlement", ENTITLED],
  ["a Student without one", UNENTITLED],
  ["an anonymous visitor", undefined],
])("the published course's cover is readable by %s", (_who, token) => {
  it("reads the file's fields directly", async () => {
    const response = await probe(`/files/${COVER_FILE_ID}?fields=${COVER_FIELDS}`, token)
    expect(response.status).toBe(200)
    expect(errorCode(response)).toBeUndefined()
    expect(item(response).id).toBe(COVER_FILE_ID)
  })

  it("reads it nested under the course, the shop routes' own selection", async () => {
    const [course] = nonEmptyItems(await probe(PUBLISHED_COVER, token))
    const cover = course.cover as { id: string; description: unknown }
    expect(cover.id).toBe(COVER_FILE_ID)
    expect(cover).toHaveProperty("description")
  })
})
