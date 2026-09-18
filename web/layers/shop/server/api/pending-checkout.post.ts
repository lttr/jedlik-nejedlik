// Hands the pending Checkout's slug to the login page and the verification
// landing, and clears the cookie in the same breath. `POST`, because reading
// it consumes it; outside `/api/checkout/` so that it can never be mistaken
// for a Course slug by the router.
export default defineEventHandler((event): { slug: string | null } => {
  return { slug: takePendingCheckout(event) }
})
