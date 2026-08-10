import { redactSensitiveParams } from "./shared/utils/redact"

// Imported by both sentry.client.config.ts and sentry.server.config.ts, which
// load outside Nuxt's auto-import graph — hence the explicit relative import.

/**
 * The parts of a Sentry event that can carry a URL. Described structurally
 * rather than imported from the SDK: this only needs the fields it rewrites,
 * and a narrow local shape keeps the helper unit-testable without constructing
 * a real Sentry event.
 */
interface ScrubbableEvent {
  request?: { url?: string; query_string?: unknown }
  transaction?: string
  breadcrumbs?: { data?: Record<string, unknown> }[]
}

function scrubRequest(request: ScrubbableEvent["request"]): void {
  if (request === undefined) {
    return
  }
  if (typeof request.url === "string") {
    request.url = redactSensitiveParams(request.url)
  }
  if (typeof request.query_string === "string") {
    request.query_string = redactSensitiveParams(request.query_string)
  }
}

function scrubBreadcrumbs(breadcrumbs: ScrubbableEvent["breadcrumbs"]): void {
  for (const { data } of breadcrumbs ?? []) {
    if (data !== undefined && typeof data.url === "string") {
      data.url = redactSensitiveParams(data.url)
    }
  }
}

/**
 * Strip credential-bearing query parameters from anything Sentry is about to
 * send. Registration and password-reset links carry single-use tokens in the
 * URL, and both configs enable `sendDefaultPii` with `tracesSampleRate: 1.0`,
 * so every pageload of such a link would otherwise report the token verbatim.
 */
export function scrubSensitiveParams<T extends ScrubbableEvent>(event: T): T {
  scrubRequest(event.request)
  scrubBreadcrumbs(event.breadcrumbs)

  if (typeof event.transaction === "string") {
    event.transaction = redactSensitiveParams(event.transaction)
  }

  return event
}
