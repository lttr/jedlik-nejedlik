// Wire shapes of Directus collections, used to type the SDK client at the
// Schema level. Kept free of app imports so both app and Nitro code can use
// them.

// Wire shape of `articles` collection in Directus.
export interface ArticleCollection {
  id: number
  title: string
  perex: string
  cover: string
  status: string
}

// Wire shape of `biography_expert`: every column the SDK can address —
// fetched columns plus columns we filter on but don't fetch. NULLable
// columns stay `| null` here; composables normalise for consumers.
export interface BiographyExpertCollection {
  name: string
  description: string | null
  url: string | null
  photo: {
    id: string
    width: number | null
    height: number | null
    description: string | null
  } | null
  status: string
}

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
