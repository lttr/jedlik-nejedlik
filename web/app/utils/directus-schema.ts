import type { ArticleCollection } from "~/composables/articles"
import type { BiographyExpertCollection } from "~/composables/biography-expert"
import type { FormSubmission } from "~/composables/forms"

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
