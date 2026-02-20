import { createItem } from "@directus/sdk"
import { directus } from "./directus"

const possibleError = new Error(
  `Omlouváme se, nepodařilo se odeslat formulář. Zkuste to prosím později.`,
)

function useDirectusForm(collection: string) {
  return useAsyncRequest<FormData>(async (data) => {
    const item = objectFromFormData(data)
    await directus.request(createItem(collection, item))
  }, possibleError)
}

export const useCooperationForm = () => useDirectusForm("cooperation_form")
export const useNewsletterExpertsForm = () =>
  useDirectusForm("newsletter_experts_form")
export const usePodcastQuestionForm = () =>
  useDirectusForm("podcast_question_form")
export const useWaitlistObesityCourseForm = () =>
  useDirectusForm("waitlist_obesity_course_form")
export const useConsultationForm = () => useDirectusForm("consultation_form")
export const useNewsletterParentsForm = () =>
  useDirectusForm("newsletter_parents_form")

export function useWebinarSignupForm() {
  return useAsyncRequest<FormData>(async (data) => {
    const item = objectFromFormData(data)
    await Promise.all([
      directus.request(
        createItem("webinar_signup_form", {
          email: item.email,
          first_name: item.first_name,
          last_name: item.last_name,
          question: item.question,
          webinar: "2026-03-obezita-otazky-odpovedi",
        }),
      ),
      directus.request(
        createItem("newsletter_parents_form", {
          email: item.email,
          first_name: item.first_name,
          last_name: item.last_name,
        }),
      ),
    ])
  }, possibleError)
}
