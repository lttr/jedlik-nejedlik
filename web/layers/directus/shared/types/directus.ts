// Wire shapes of Directus collections, used to type the SDK client at the
// Schema level. Kept free of app imports so both app and Nitro code can use
// them.

import type { z } from "zod"
import type { BiographyExpertSchema } from "../utils/schemas"

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

export interface Schema {
  articles: ArticleCollection[]
  biography_expert: BiographyExpertCollection[]
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
