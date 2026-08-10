export interface UseAuthRequestResult {
  execute: () => Promise<boolean>
  pending: Ref<boolean>
  errorMessage: Ref<string | null>
}

/**
 * Submit state for an auth form.
 *
 * The marketing forms use `useAsyncRequest`, which replaces every failure with
 * one fixed message. Auth needs the opposite: the server routes decide the
 * wording (spec decision 6) — which message is safe to show, and which
 * failures must be indistinguishable — so this surfaces what they sent.
 *
 * `execute` resolves to whether the request succeeded, letting the caller
 * decide what happens next instead of threading a status ref through the page.
 */
export function useAuthRequest(request: () => Promise<unknown>): UseAuthRequestResult {
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)

  async function execute(): Promise<boolean> {
    pending.value = true
    errorMessage.value = null

    try {
      await request()
      return true
    } catch (error) {
      errorMessage.value = authErrorMessage(error)
      return false
    } finally {
      pending.value = false
    }
  }

  return { errorMessage, execute, pending }
}
