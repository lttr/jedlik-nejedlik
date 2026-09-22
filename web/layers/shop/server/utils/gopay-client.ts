import type { H3Event } from "h3"

import { createGopayApiClient } from "./gopay-api-client"
import { createGopayMockClient } from "./gopay-mock-client"
import type { GopayClient } from "../../shared/utils/gopay"

// The one place that decides which GoPay the site talks to: everything else
// takes a `GopayClient` and never learns which one it got. `mock` is refused
// outside development by the runtime-config schema.

const SANDBOX_BASE_URL = "https://gw.sandbox.gopay.com"
const PRODUCTION_BASE_URL = "https://gate.gopay.cz"

function gopayBaseUrl(env: string): string {
  if (env === "sandbox") {
    return SANDBOX_BASE_URL
  }
  if (env === "production") {
    return PRODUCTION_BASE_URL
  }
  throw new Error(`Unknown NUXT_GOPAY_ENV "${env}"`)
}

// Kept for the process, so the access token is cached across requests rather
// than fetched for each one.
let apiClient: GopayClient | undefined

export function getGopayClient(event: H3Event): GopayClient {
  const { gopay } = useRuntimeConfig(event)

  if (gopay.env === "mock") {
    // Not cached: the mock's gateway URLs are built from the origin the
    // request arrived at. Its Payments live in a module-level map, so
    // instances share the same state anyway.
    return createGopayMockClient(getRequestURL(event).origin)
  }

  apiClient ??= createGopayApiClient({
    baseUrl: gopayBaseUrl(gopay.env),
    goid: gopay.goid,
    clientId: gopay.clientId,
    clientSecret: gopay.clientSecret,
  })
  return apiClient
}
