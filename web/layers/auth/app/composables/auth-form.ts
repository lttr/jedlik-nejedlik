export interface AuthForm {
  pending: Ref<boolean>
  errorMessage: Ref<string>
  submit: (action: () => Promise<void>) => Promise<void>
}

// The shape every auth form shares: disable while in flight, clear the last
// error, run the action, show whatever Czech message came back.
export function useAuthForm(): AuthForm {
  const pending = ref(false)
  const errorMessage = ref("")

  async function submit(action: () => Promise<void>): Promise<void> {
    pending.value = true
    errorMessage.value = ""
    try {
      await action()
    } catch (error) {
      errorMessage.value = authErrorMessage(error)
    } finally {
      pending.value = false
    }
  }

  return { pending, errorMessage, submit }
}
