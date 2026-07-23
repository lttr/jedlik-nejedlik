import { registerUser } from "@directus/sdk"

import { registerSchema } from "../../../shared/utils/auth"

// Native Directus public registration. Assigns the instance's configured
// default role (Student) and, with email verification on, sends the
// verification mail via Directus/Mailgun. Requires `public_registration = true`
// on the instance (see the area-02 spec's Open prerequisites).
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (input) => registerSchema.parse(input))

  try {
    await getDirectusRest(event).request(
      registerUser(body.email, body.password, {
        verification_url: `${requestOrigin(event)}/prihlaseni?verified=1`,
        first_name: body.first_name,
        last_name: body.last_name,
      }),
    )
  } catch {
    // Don't leak whether the address already exists or other Directus internals.
    throw createError({
      statusCode: 400,
      message: "Registraci se nepodařilo dokončit. Zkontrolujte zadané údaje a zkuste to znovu.",
    })
  }

  setResponseStatus(event, 204)
  return null
})
