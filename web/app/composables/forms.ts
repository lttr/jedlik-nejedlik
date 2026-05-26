import { createItem } from "@directus/sdk"
import type { UseAsyncRequestResult } from "./async-request"
import type { FormCollection } from "~/utils/directus-schema"

export type FormSubmission = Record<string, unknown>

const possibleError = new Error(
  `Omlouváme se, nepodařilo se odeslat formulář. Zkuste to prosím později.`,
)

function useDirectusForm(collection: FormCollection): UseAsyncRequestResult<FormData> {
  return useAsyncRequest<FormData>(async (data) => {
    const item = objectFromFormData(data)
    await getDirectusClient().request(createItem(collection, item))
  }, possibleError)
}

export const useCooperationForm = (): UseAsyncRequestResult<FormData> =>
  useDirectusForm("cooperation_form")
export const useNewsletterExpertsForm = (): UseAsyncRequestResult<FormData> =>
  useDirectusForm("newsletter_experts_form")
export const usePodcastQuestionForm = (): UseAsyncRequestResult<FormData> =>
  useDirectusForm("podcast_question_form")
export const useWaitlistObesityCourseForm = (): UseAsyncRequestResult<FormData> =>
  useDirectusForm("waitlist_obesity_course_form")
export const useConsultationForm = (): UseAsyncRequestResult<FormData> =>
  useDirectusForm("consultation_form")
export const useNewsletterParentsForm = (): UseAsyncRequestResult<FormData> =>
  useDirectusForm("newsletter_parents_form")

export function useWebinarSignupForm(webinarId: string): UseAsyncRequestResult<FormData> {
  return useAsyncRequest<FormData>(async (data) => {
    const item = objectFromFormData(data)
    await Promise.all([
      getDirectusClient().request(
        createItem("webinar_signup_form", {
          email: item.email,
          first_name: item.first_name,
          last_name: item.last_name,
          question: item.question,
          webinar: webinarId,
        }),
      ),
      getDirectusClient().request(
        createItem("newsletter_parents_form", {
          email: item.email,
          first_name: item.first_name,
          last_name: item.last_name,
        }),
      ),
    ])
  }, possibleError)
}
