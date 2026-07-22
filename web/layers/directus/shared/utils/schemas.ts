import { z } from "zod"

// Wire codecs: parse Directus responses and normalise null → undefined so
// consumers get idiomatic optional keys. These are the single source of
// truth for the collection shapes — wire types in ../types/directus.ts
// derive from their inputs, consumer contracts from their outputs.

// Subset of the `directus_files` columns the app actually consumes. `id` is
// mandatory; the rest are NULLable in the database.
export const ImageSchema = z
  .object({
    id: z.string(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    description: z.string().nullable(),
  })
  .transform((o) => ({
    id: o.id,
    width: o.width ?? undefined,
    height: o.height ?? undefined,
    description: o.description ?? undefined,
  }))

export type Image = z.output<typeof ImageSchema>

// Consumer contract: optional keys (omitted when null on the wire).
export interface BiographyExpert {
  name: string
  description?: string
  url?: string
  photo?: Image
}

export const BiographyExpertSchema = z
  .object({
    name: z.string(),
    description: z.string().nullable(),
    url: z.string().nullable(),
    photo: ImageSchema.nullable(),
  })
  .transform(
    (o): BiographyExpert => ({
      name: o.name,
      description: o.description ?? undefined,
      url: o.url ?? undefined,
      photo: o.photo ?? undefined,
    }),
  )

// --- Kurzy (course → section → lesson) ------------------------------------

// Consumer contract: the public catalog shape of a published Course.
export interface Course {
  id: number
  title: string
  slug: string
  description?: string
  cover?: Image
  price_czk?: number
  sort?: number
}

export const CourseSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    cover: ImageSchema.nullable(),
    price_czk: z.number().nullable(),
    sort: z.number().nullable(),
  })
  .transform(
    (o): Course => ({
      id: o.id,
      title: o.title,
      slug: o.slug,
      description: o.description ?? undefined,
      cover: o.cover ?? undefined,
      price_czk: o.price_czk ?? undefined,
      sort: o.sort ?? undefined,
    }),
  )

// Consumer contract: Section outline. `course` is the parent's id.
export interface Section {
  id: number
  course: number
  title: string
  sort?: number
}

export const SectionSchema = z
  .object({
    id: z.number(),
    course: z.number(),
    title: z.string(),
    sort: z.number().nullable(),
  })
  .transform(
    (o): Section => ({
      id: o.id,
      course: o.course,
      title: o.title,
      sort: o.sort ?? undefined,
    }),
  )

// Consumer contract: Lesson outline. `section` is the parent's id. Paid
// fields (body, video_uid, materials) are not part of the outline — the
// entitlement-gated shape arrives with the LMS areas.
export interface Lesson {
  id: number
  section: number
  title: string
  type: "video" | "text"
  sort?: number
}

export const LessonSchema = z
  .object({
    id: z.number(),
    section: z.number(),
    title: z.string(),
    type: z.enum(["video", "text"]),
    sort: z.number().nullable(),
  })
  .transform(
    (o): Lesson => ({
      id: o.id,
      section: o.section,
      title: o.title,
      type: o.type,
      sort: o.sort ?? undefined,
    }),
  )
