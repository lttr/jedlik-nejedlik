import { createItem } from "@directus/sdk"
import { directus } from "./directus"

const possibleError = new Error(
  `Omlouváme se, nepodařilo se odeslat formulář. Zkuste to prosím později.`,
)

export function useCooperationForm() {
  async function asyncRequest(data: FormData) {
    const item = objectFromFormData(data)
    await directus.request(createItem("cooperation_form", item))
  }
  return useAsyncRequest<FormData>(asyncRequest, possibleError)
}

export function useNewsletterExpertsForm() {
  async function asyncRequest(data: FormData) {
    const item = objectFromFormData(data)
    await directus.request(createItem("newsletter_experts_form", item))
  }
  return useAsyncRequest<FormData>(asyncRequest, possibleError)
}

export function usePodcastQuestionForm() {
  async function asyncRequest(data: FormData) {
    const item = objectFromFormData(data)
    await directus.request(createItem("podcast_question_form", item))
  }
  return useAsyncRequest<FormData>(asyncRequest, possibleError)
}

export function useWaitlistObesityCourseForm() {
  async function asyncRequest(data: FormData) {
    const item = objectFromFormData(data)
    await directus.request(createItem("waitlist_obesity_course_form", item))
  }
  return useAsyncRequest<FormData>(asyncRequest, possibleError)
}

export function useNewsletterParentsForm() {
  async function asyncRequest(data: FormData) {
    const item = objectFromFormData(data)
    await directus.request(createItem("newsletter_parents_form", item))
  }
  return useAsyncRequest<FormData>(asyncRequest, possibleError)
}
