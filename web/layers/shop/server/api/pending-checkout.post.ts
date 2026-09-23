import { takePendingCheckout } from "../utils/pending-checkout"

// Hands the pending Checkout's slug to the login page and the verification
// landing, and clears the cookie in the same breath — `POST`, because reading
// it consumes it. See docs/shop.md, „Pending checkout“.
export default defineEventHandler((event): { slug: string | null } => {
  return { slug: takePendingCheckout(event) }
})
