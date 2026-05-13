import * as Sentry from "@sentry/nuxt"
import type { NuxtError } from "nuxt/app"
import type { Ref } from "vue"

// `useAsyncData` catches handler/transform errors into `.error.value` and
// resolves normally, so a call site that only reads `.data` renders as if the
// data were missing. Attach this watcher to surface those silent failures:
// logs in dev, captures in Sentry in prod. (`vue:error` / `app:error` cover
// thrown errors, not these caught ones.)
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
