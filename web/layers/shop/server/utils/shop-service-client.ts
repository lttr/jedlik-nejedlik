import type { H3Event } from "h3"

// The third server client, next to the anonymous one (directus layer) and the
// caller-bound one (auth layer): the Shop Service Account, whose policy allows
// exactly the writes the payment flow needs — stamp a Payment on an Order,
// settle it, grant an Entitlement (ADR 0006). Nothing else may use it; a read
// a Student is allowed to do belongs on their own session, so Directus stays
// the one place that decides what they may see (ADR 0004).
//
// Stateless like the anonymous client, so one per process; the event only
// reaches the runtime config.
let client: DirectusRestClient | null = null

export function getShopServiceDirectusClient(event: H3Event): DirectusRestClient {
  const config = useRuntimeConfig(event)
  client ??= createDirectusTokenClient(config.public.directusUrl, config.shop.directusToken)
  return client
}
