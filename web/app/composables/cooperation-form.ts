import { createItem } from "@directus/sdk"
import { directus } from "./directus"

function objectFromFormData(formData: FormData) {
  return Object.fromEntries(
    formData.entries().map(([key, value]) => [key, String(value)]),
  )
}

export async function useCooperationForm() {
  const formData = ref<FormData>()

  const results = await useAsyncData(
    "cooperation-forms",
    async () => {
      try {
        if (!formData.value) {
          throw new Error("Formulář nemá data")
        }
        const item = objectFromFormData(formData.value)
        return await directus.request(createItem("cooperation_form", item))
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

  return {
    ...results,
    formData,
  }
}
