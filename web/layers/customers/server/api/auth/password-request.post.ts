import { passwordRequest } from "@directus/sdk"
import { z } from "zod"

const RequestSchema = z.object({
  email: z.string().trim().pipe(z.email()),
})

export default defineEventHandler(async (event) => {
  const body: unknown = await readBody(event).catch(() => undefined)
  const parsed = RequestSchema.safeParse(body)

  if (parsed.success) {
    // Only a request that would actually make Directus send mail costs
    // anything, so only that one spends the budget.
    enforceRateLimit(event, PASSWORD_REQUEST_RATE_LIMIT)

    // Directus owns the token and sends the e-mail (ADR 0002). The reset link
    // points back at this site; Directus's PASSWORD_RESET_URL_ALLOW_LIST is
    // what stops a spoofed Host header from redirecting it elsewhere.
    const resetUrl = new URL("/obnova-hesla", getRequestURL(event).origin).toString()
    await getDirectusAnonymousServerClient(event)
      .request(passwordRequest(parsed.data.email, resetUrl))
      .catch((error: unknown) => {
        console.error("Directus refused a password reset request", error)
      })
  }

  // One answer for every input: an unknown e-mail, a malformed one and a
  // real one are indistinguishable from out here.
  return { message: authMessages.resetRequested }
})
