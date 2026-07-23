import type { Ref } from "vue"

interface UseAuthForm {
  pending: Ref<boolean>
  errorMessage: Ref<string>
  submit: (action: () => Promise<void>, fallback: string) => Promise<boolean>
}

// Shared submit state for the auth forms: pending flag, error message, and a
// runner that wraps the try/catch/finally so each page keeps only its own
// success behaviour. Returns whether the action succeeded.
export function useAuthForm(): UseAuthForm {
  const pending = ref(false)
  const errorMessage = ref("")

  async function submit(action: () => Promise<void>, fallback: string): Promise<boolean> {
    pending.value = true
    errorMessage.value = ""
    try {
      await action()
      return true
    } catch (error) {
      errorMessage.value = authErrorMessage(error, fallback)
      return false
    } finally {
      pending.value = false
    }
  }

  return { pending, errorMessage, submit }
}
