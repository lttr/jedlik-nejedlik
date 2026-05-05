import { ref } from "vue"

export interface UseAsyncRequestResult<TInputData> {
  execute: (data: TInputData) => Promise<void>
  status: Ref<"idle" | "pending" | "success" | "error">
  isSuccess: ComputedRef<boolean>
  isPendingOrSuccess: ComputedRef<boolean>
  error: Ref<Error | null>
}

const timeout = async (ms: number) =>
  new Promise((_, reject) => {
    setTimeout(reject, ms)
  })

export function useAsyncRequest<TInputData, TOutputData = void>(
  asyncFn: (data: TInputData) => Promise<TOutputData>,
  defaultError: Error,
  timeoutMs: number = 25000,
): UseAsyncRequestResult<TInputData> {
  const status = ref<"idle" | "pending" | "success" | "error">("idle")
  const error = ref<Error | null>(null)

  async function execute(data: TInputData) {
    status.value = "pending"
    error.value = null

    try {
      await Promise.race([asyncFn(data), timeout(timeoutMs)])
      status.value = "success"
    } catch {
      error.value = defaultError
      status.value = "error"
    }
  }

  return {
    error,
    execute,
    isPendingOrSuccess: computed(() => ["pending", "success"].includes(status.value)),
    isSuccess: computed(() => status.value === "success"),
    status,
  }
}
