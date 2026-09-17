import type { CheckoutView } from "../../../shared/utils/checkout"

// What the Checkout page needs to render itself for the Student who asked.
// Every refusal is the page's refusal too: 401 has no session, 404 has no
// readable Course, 409 is a Course this Student cannot buy — and the page
// then never shows them the form.
export default defineEventHandler(async (event): Promise<CheckoutView> => {
  const slug = getRouterParam(event, "slug") ?? ""
  const { account, client } = await requireAccountDirectusClient(event)

  const course = await loadCheckoutCourse(client, slug)
  await assertNotEntitled(client, course.id)

  return { course, email: account.email, billing: await readAccountBilling(client) }
})
