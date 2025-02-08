import { createItem } from "@directus/sdk"
import { directus } from "./directus"

function objectFromFormData(formData: FormData) {
  return Object.fromEntries(
    formData.entries().map(([key, value]) => [key, String(value)]),
  )
}

export async function useNewsletterForExpertsForm() {
  return useAsyncData(
    "newsletter-for-experts-forms",
    async () => {
      const item = objectFromFormData(formData)
      try {
        return await directus.request(
          createItem("newsletter_for_experts_form", item),
        )
      } catch {
        throw new Error(
          `Omlouváme se, nepodařilo se odeslat formulář. Zkuste to prosím později.`,
        )
      }
    },
    {
      immediate: false,
      dedupe: "defer",
    },
  )
}
