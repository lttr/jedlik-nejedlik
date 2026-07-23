import { passwordReset } from "@directus/sdk"

import { passwordResetSchema } from "../../../shared/utils/auth"

// Complete a reset with the token from the emailed link plus the new password.
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (input) => passwordResetSchema.parse(input))

  try {
    await getDirectusRest(event).request(passwordReset(body.token, body.password))
  } catch {
    throw createError({
      statusCode: 400,
      message: "Odkaz pro obnovu hesla je neplatný nebo mu vypršela platnost.",
    })
  }

  setResponseStatus(event, 204)
  return null
})
