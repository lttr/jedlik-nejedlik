import { emptyBillingDetails } from "../../../shared/utils/checkout"
import type { CheckoutView } from "../../../shared/utils/checkout"

// Every refusal is the Checkout page's refusal too: 404 has no readable
// Course, 409 a Course that cannot be bought. A visitor without an Account is
// answered as well, minus the identity (ADR 0005).
// See docs/shop.md, „Checkout".
export default defineEventHandler(async (event): Promise<CheckoutView> => {
  const slug = getRouterParam(event, "slug") ?? ""
  const { account } = await readAccountSession(event)
  const client = await getCallerDirectusClient(event)

  if (account === undefined) {
    const course = await loadCheckoutCourse(client, slug)
    return { course, email: null, billing: emptyBillingDetails() }
  }

  // Neither read depends on the other, so they go together; the Entitlement
  // check stays after them because it needs the Course's id.
  const [course, billing] = await Promise.all([
    loadCheckoutCourse(client, slug),
    readAccountBilling(client),
  ])
  await assertNotEntitled(client, course.id)
  return { course, email: account.email, billing }
})
