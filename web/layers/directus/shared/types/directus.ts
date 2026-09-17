// Wire shapes of Directus collections, used to type the SDK client at the
// Schema level. Kept free of app imports so both app and Nitro code can use
// them.

import type { z } from "zod"
import type {
  BiographyExpertSchema,
  CourseSchema,
  EntitlementSchema,
  LessonSchema,
  OrderConsentSchema,
  OrderSchema,
  SectionSchema,
} from "../utils/schemas"

// Wire shape of `articles` collection in Directus.
export interface ArticleCollection {
  id: number
  title: string
  perex: string
  cover: string
  status: string
}

// Wire shape of `biography_expert`: the codec's input plus `status`, a
// column we filter on but don't fetch.
export type BiographyExpertCollection = z.input<typeof BiographyExpertSchema> & { status: string }

export type FormSubmission = Record<string, unknown>

// Wire shapes of the Kurzy collections: the codec's input plus columns that
// exist on the wire but aren't part of the public codec (status is filtered
// on; the rest are config/paid fields for later areas).
export type CourseCollection = z.input<typeof CourseSchema> & {
  status: string
  test_pass_threshold: number | null
  user_created: string | null
  date_created: string | null
  date_updated: string | null
  // O2M: ids on the wire, rows when the query expands the relation.
  sections: SectionCollection[] | number[]
}

export type SectionCollection = z.input<typeof SectionSchema> & {
  unlock_rule: string
  unlock_delay_days: number | null
  date_created: string | null
  date_updated: string | null
  lessons: LessonCollection[] | number[]
}

export type LessonCollection = z.input<typeof LessonSchema> & {
  body: string | null
  video_uid: string | null
  date_created: string | null
  date_updated: string | null
  materials: number[]
}

// Junction rows behind `lesson.materials` (M2M to directus_files).
export interface LessonMaterialCollection {
  id: number
  lesson_id: number
  directus_files_id: string
  sort: number | null
}

// Wire shapes of the transactional Kurzy collections: the codec's input plus
// columns/aliases that exist on the wire but aren't part of the codec.
export type OrderCollection = z.input<typeof OrderSchema> & {
  date_created: string | null
  date_updated: string | null
  // O2M: ids on the wire, rows when a query expands the relation, and the
  // rows to write when the Checkout places an Order with its Consent in one
  // request.
  consents: number[] | OrderConsentCollection[] | NewOrderConsent[]
  // Billing Details as they were when the Order was placed. A snapshot, so a
  // later change on the Account never alters an issued invoice; all optional,
  // because a name is never a wall between a Student and a Course.
  billing_name: string | null
  billing_company: string | null
  billing_ic: string | null
  billing_street: string | null
  billing_city: string | null
  billing_zip: string | null
}

export type OrderConsentCollection = z.input<typeof OrderConsentSchema>

// A Consent as it is created: the id and the parent are Directus's to fill in
// (the parent because it is nested under its Order), `granted_at` the Student
// policy's preset, so that the moment of consent is the server's clock.
export type NewOrderConsent = Pick<OrderConsentCollection, "document" | "document_version">

export type EntitlementCollection = z.input<typeof EntitlementSchema>

// The `directus_users` columns this app touches. Naming the collection in the
// Schema replaces the SDK's built-in system shape, which is the only way the
// Billing Details — custom columns Directus knows nothing about — become
// typed; the price is that anything else the app reads or writes on a user has
// to be listed here too.
export interface AccountUserCollection {
  id: string
  email: string
  password: string
  billing_name: string | null
  billing_company: string | null
  billing_ic: string | null
  billing_street: string | null
  billing_city: string | null
  billing_zip: string | null
}

export interface Schema {
  directus_users: AccountUserCollection[]
  articles: ArticleCollection[]
  biography_expert: BiographyExpertCollection[]
  course: CourseCollection[]
  section: SectionCollection[]
  lesson: LessonCollection[]
  lesson_material: LessonMaterialCollection[]
  order: OrderCollection[]
  order_consent: OrderConsentCollection[]
  entitlement: EntitlementCollection[]
  cooperation_form: FormSubmission[]
  newsletter_experts_form: FormSubmission[]
  podcast_question_form: FormSubmission[]
  waitlist_obesity_course_form: FormSubmission[]
  consultation_form: FormSubmission[]
  newsletter_parents_form: FormSubmission[]
  webinar_signup_form: FormSubmission[]
}

export type FormCollection = {
  [K in keyof Schema]: Schema[K] extends FormSubmission[] ? K : never
}[keyof Schema]
