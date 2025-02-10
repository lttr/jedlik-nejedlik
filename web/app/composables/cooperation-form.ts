import { createItem } from "@directus/sdk"
import { directus } from "./directus"
import { ref } from "vue"

function objectFromFormData(formData: FormData) {
  return Object.fromEntries(
    formData.entries().map(([key, value]) => [key, String(value)]),
  )
}

interface UseAsyncRequestResult<TInputData> {
  execute: (data: TInputData) => Promise<void>
  status: Ref<"idle" | "pending" | "success" | "error">
  isSuccess: ComputedRef<boolean>
  isPendingOrSuccess: ComputedRef<boolean>
  error: Ref<Error | null>
}

export function useAsyncRequest<TInputData, TOutputData = void>(
  asyncFn: (data: TInputData) => Promise<TOutputData>,
  defaultError: Error,
): UseAsyncRequestResult<TInputData> {
  const status = ref<"idle" | "pending" | "success" | "error">("idle")
  const error = ref<Error | null>(null)

  async function execute(data: TInputData) {
    status.value = "pending"
    error.value = null

    try {
      await asyncFn(data)
      status.value = "success"
    } catch {
      error.value = defaultError
      status.value = "error"
    }
  }

  return {
    error,
    execute,
    isPendingOrSuccess: computed(() =>
      ["pending", "success"].includes(status.value),
    ),
    isSuccess: computed(() => status.value === "success"),
    status,
  }
}

export function useCooperationForm(): UseAsyncRequestResult<FormData> {
  async function asyncRequest(data: FormData) {
    const item = objectFromFormData(data)
    await directus.request(createItem("cooperation_form", item))
  }
  const possibleError = new Error(
    `Omlouváme se, nepodařilo se odeslat formulář. Zkuste to prosím později.`,
  )
  return useAsyncRequest<FormData>(asyncRequest, possibleError)
}
