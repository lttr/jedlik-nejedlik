import { passwordRequest } from "@directus/sdk"

import { passwordRequestSchema } from "../../../shared/utils/auth"

// Ask Directus to email a reset link pointing back at our /obnova-hesla page
// (Directus appends `?token=`). Always 204 — never reveal whether the address
// has an account.
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (input) => passwordRequestSchema.parse(input))

  try {
    await getDirectusRest(event).request(
      passwordRequest(body.email, `${requestOrigin(event)}/obnova-hesla`),
    )
  } catch {
    // Swallow: response must not depend on whether the email exists.
  }

  setResponseStatus(event, 204)
  return null
})
