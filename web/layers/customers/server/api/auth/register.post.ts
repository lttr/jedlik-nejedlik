import { registerUser } from "@directus/sdk"

// Account-first registration (O-17). Directus owns the whole flow: it assigns
// the Student role from `public_registration_role`, hashes the password, and
// mails the verification link — which points at our own page, not a Directus
// URL. See spec decision 3 for the instance settings this depends on.

export default defineEventHandler(async (event) => {
  const parsed = RegisterSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Zkontrolujte prosím e-mail a heslo. Heslo musí mít alespoň ${PASSWORD_MIN_LENGTH} znaků.`,
    })
  }

  const { email, password, firstName, lastName } = parsed.data
  const verificationUrl = siteUrlFor(event, REGISTER_VERIFY_PATH)

  try {
    await getServerDirectusClient().request(
      registerUser(email, password, {
        verification_url: verificationUrl,
        first_name: firstName,
        last_name: lastName,
      }),
    )
  } catch (error) {
    swallowRejection(error, "Registrace")
  }

  setResponseStatus(event, 204)
})
