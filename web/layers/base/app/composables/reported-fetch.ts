import * as Sentry from "@sentry/nuxt"

// A failed `useFetch`/`useAsyncData` resolves normally, so a page reading only
// `data` shows it as missing data and no error hook fires. These variants
// report it where it happened.

// Ours to fix: no answer at all, or a 5xx. A 4xx is the page's own answer (a
// draft Course's 404, a Checkout's 409) and is rendered, not reported. An
// abort is a navigation that moved on.
function isReportable(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return false
  }
  const status = numberField(error, "statusCode") ?? numberField(error, "status")
  return status === undefined || status >= 500
}

function numberField(error: unknown, field: string): number | undefined {
  if (typeof error !== "object" || error === null || !(field in error)) {
    return undefined
  }
  const value: unknown = Reflect.get(error, field)
  return typeof value === "number" ? value : undefined
}

function report(error: unknown, key: string): void {
  if (!isReportable(error)) {
    return
  }
  if (import.meta.dev) {
    console.error(`[async-data:${key}]`, error)
  }
  Sentry.captureException(error, { tags: { asyncDataKey: key } })
}

function reportingMiddleware<T>(key: () => string): (next: () => Promise<T>) => Promise<T> {
  return async (next) => {
    try {
      return await next()
    } catch (error) {
      report(error, key())
      throw error
    }
  }
}

const reportFetchErrors = defineUseFetchAddon({
  setup(options) {
    let url = ""
    options.onRequest.push(({ request }) => {
      url = typeof request === "string" ? request : request.url
    })
    options.middleware.push(reportingMiddleware(() => toValue(options.key) ?? url))
  },
})

// An add-on never sees `useAsyncData`'s positional key, so these are tagged by
// kind only; the event's stack and route still place them.
const reportAsyncDataErrors = defineUseAsyncDataAddon({
  setup(options) {
    options.middleware.push(reportingMiddleware(() => "useAsyncData"))
  },
})

export const useReportedFetch = createUseFetch({ addons: [reportFetchErrors] })

export const useReportedAsyncData = createUseAsyncData({ addons: [reportAsyncDataErrors] })
