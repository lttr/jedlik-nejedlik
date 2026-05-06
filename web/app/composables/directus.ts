import type { DirectusFile } from "@directus/sdk"
import { createDirectus, rest } from "@directus/sdk"

interface Article {
  id: number
  title: string
  perex: string
  cover: string
  status: string
}

interface BiographyExpertItem {
  name: string
  description: string | null
  url: string | null
  photo: DirectusFile<Schema> | string | null
  status: string
}

type FormSubmission = Record<string, unknown>

export interface Schema {
  articles: Article[]
  biography_expert: BiographyExpertItem[]
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

export const directus = createDirectus<Schema>(DIRECTUS_URL).with(rest())
