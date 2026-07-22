// Wire shapes of Directus collections, used to type the SDK client at the
// Schema level. Kept free of app imports so both app and Nitro code can use
// them.

import type { z } from "zod"
import type {
  BiographyExpertSchema,
  CourseSchema,
  LessonSchema,
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
  sections: number[]
}

export type SectionCollection = z.input<typeof SectionSchema> & {
  unlock_rule: string
  unlock_delay_days: number | null
  date_created: string | null
  date_updated: string | null
  lessons: number[]
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

export interface Schema {
  articles: ArticleCollection[]
  biography_expert: BiographyExpertCollection[]
  course: CourseCollection[]
  section: SectionCollection[]
  lesson: LessonCollection[]
  lesson_material: LessonMaterialCollection[]
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
