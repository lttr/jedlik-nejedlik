import { emptyBillingDetails } from "../../../shared/utils/checkout"
import type { CheckoutView } from "../../../shared/utils/checkout"

// What the Checkout page needs to render itself for whoever asked. Every
// refusal is the page's refusal too: 404 has no readable Course, 409 is a
// Course that cannot be bought — and the page then never shows the form.
//
// A visitor without an Account is answered as well, because step 1 is where
// they log in or register (ADR 0005): they get the Course and no identity.
// What they may read is Directus's decision either way (ADR 0004).
export default defineEventHandler(async (event): Promise<CheckoutView> => {
  const slug = getRouterParam(event, "slug") ?? ""
  const { account } = await readAccountSession(event)
  const client = await getCallerDirectusClient(event)

  const course = await loadCheckoutCourse(client, slug)
  if (account === undefined) {
    return { course, email: null, billing: emptyBillingDetails() }
  }

  await assertNotEntitled(client, course.id)
  return { course, email: account.email, billing: await readAccountBilling(client) }
})
