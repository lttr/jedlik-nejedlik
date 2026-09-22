import type { H3Event } from "h3"

// The Shop Service Account: the writes the payment flow needs, and nothing
// else (ADR 0006). A read a Student is allowed to do belongs on their own
// session (ADR 0004). See docs/shop.md, „Server clients“.
let client: DirectusRestClient | null = null

export function getShopServiceDirectusClient(event: H3Event): DirectusRestClient {
  const config = useRuntimeConfig(event)
  client ??= createDirectusTokenClient(config.public.directusUrl, config.shop.directusToken)
  return client
}
