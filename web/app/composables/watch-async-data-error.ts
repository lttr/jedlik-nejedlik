import * as Sentry from "@sentry/nuxt"
import type { NuxtError } from "nuxt/app"
import type { Ref } from "vue"

// `useAsyncData` resolves normally on a handler error, so a call site reading
// only `.data` renders as if the data were missing. This watcher surfaces those
// silent failures; `vue:error` and `app:error` do not see them.
export function watchAsyncDataError(key: string, error: Ref<NuxtError | undefined>): void {
  watch(
    error,
    (err) => {
      if (err === undefined) {
        return
      }
      if (import.meta.dev) {
        console.error(`[useAsyncData:${key}]`, err)
      }
      Sentry.captureException(err, { tags: { asyncDataKey: key } })
    },
    { immediate: true },
  )
}
