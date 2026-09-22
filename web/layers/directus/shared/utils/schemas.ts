import { z } from "zod"

// Wire codecs: parse Directus responses and normalise null → undefined so
// consumers get idiomatic optional keys. These are the single source of
// truth for the collection shapes — wire types in ../types/directus.ts
// derive from their inputs, consumer contracts from their outputs.

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
  .transform((o): BiographyExpert => ({
    name: o.name,
    description: o.description ?? undefined,
    url: o.url ?? undefined,
    photo: o.photo ?? undefined,
  }))

// --- Kurzy (course → section → lesson) ------------------------------------

// Consumer contract: the Course statuses the shop deals in. `published` is
// what a visitor may read anyway; `draft` only ever comes back for an
// Author's own token, because the public policy filters on published (ADR
// 0004). Any status added later (archived, a Live Course marker) stays out
// of the shop until it is listed here — the filter the routes send and the
// codecs that parse the rows both derive from this one enum, so they cannot
// disagree.
export const CourseStatusSchema = z.enum(["published", "draft"])

export type CourseStatus = z.output<typeof CourseStatusSchema>

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
  .transform((o): Course => ({
    id: o.id,
    title: o.title,
    slug: o.slug,
    description: o.description ?? undefined,
    cover: o.cover ?? undefined,
    price_czk: o.price_czk ?? undefined,
    sort: o.sort ?? undefined,
  }))

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
  .transform((o): Section => ({
    id: o.id,
    course: o.course,
    title: o.title,
    sort: o.sort ?? undefined,
  }))

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
  .transform((o): Lesson => ({
    id: o.id,
    section: o.section,
    title: o.title,
    type: o.type,
    sort: o.sort ?? undefined,
  }))

// --- Kurzy transactional collections (order, consents, entitlement) --------

export interface Order {
  id: number
  student: string
  course: number
  status: "created" | "paid" | "cancelled"
  price_czk: number
  gopay_payment_id?: string
  fakturoid_invoice_id?: string
}

export const OrderSchema = z
  .object({
    id: z.number(),
    student: z.string(),
    course: z.number(),
    status: z.enum(["created", "paid", "cancelled"]),
    price_czk: z.number(),
    gopay_payment_id: z.string().nullable(),
    fakturoid_invoice_id: z.string().nullable(),
  })
  .transform((o): Order => ({
    id: o.id,
    student: o.student,
    course: o.course,
    status: o.status,
    price_czk: o.price_czk,
    gopay_payment_id: o.gopay_payment_id ?? undefined,
    fakturoid_invoice_id: o.fakturoid_invoice_id ?? undefined,
  }))

export interface OrderConsent {
  id: number
  order: number
  document: "terms" | "withdrawal_1837" | "gdpr"
  document_version: string
  granted_at: string
}

export const OrderConsentSchema = z
  .object({
    id: z.number(),
    order: z.number(),
    document: z.enum(["terms", "withdrawal_1837", "gdpr"]),
    document_version: z.string(),
    granted_at: z.string(),
  })
  .transform((o): OrderConsent => o)

// Consumer contract: an Entitlement (Oprávnění ke kurzu). `order` is absent
// for manual grants; `granted_at` is an ISO timestamp.
export interface Entitlement {
  id: number
  student: string
  course: number
  order?: number
  granted_at?: string
}

export const EntitlementSchema = z
  .object({
    id: z.number(),
    student: z.string(),
    course: z.number(),
    order: z.number().nullable(),
    granted_at: z.string().nullable(),
  })
  .transform((o): Entitlement => ({
    id: o.id,
    student: o.student,
    course: o.course,
    order: o.order ?? undefined,
    granted_at: o.granted_at ?? undefined,
  }))
