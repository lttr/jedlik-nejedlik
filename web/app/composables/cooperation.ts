import { createItem } from "@directus/sdk"
import { directus } from "./directus"
import type { AsyncDataRequestStatus } from "#app"

export async function useCooperationForm() {
  const status = ref<AsyncDataRequestStatus>("idle")
  const error = ref<Error>()

  async function execute(formData: FormData) {
    status.value = "pending"
    const item = objectFromFormData(formData)
    try {
      await directus.request(createItem("cooperation_form", item))
      status.value = "success"
    } catch (e) {
      error.value = new Error(
        `Omlouváme se, nepodařilo se odeslat formulář. Zkuste to prosím později.`,
      )
      status.value = "error"
      throw e
    }
  }

  return {
    status,
    error,
    execute,
  }
}

function objectFromFormData(formData: FormData) {
  return Object.fromEntries(
    formData.entries().map(([key, value]) => [key, String(value)]),
  )
}
