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
    const code = directusErrorCode(error)

    // Rate limiting is worth reporting honestly — it tells the visitor to wait
    // rather than to doubt what they typed.
    if (code === "REQUESTS_EXCEEDED") {
      throw createError({
        statusCode: 429,
        statusMessage: "Too Many Requests",
        message: "Příliš mnoho pokusů. Zkuste to prosím za chvíli.",
      })
    }

    // No error code means Directus never answered. Swallowing that would show
    // "check your inbox" for a mail that will never arrive, and the visitor
    // would wait instead of retrying. Leaks nothing: it says the service is
    // down, not whether the address is taken.
    if (code === undefined) {
      throw createError({
        statusCode: 502,
        statusMessage: "Bad Gateway",
        message: "Registrace je dočasně nedostupná. Zkuste to prosím za chvíli.",
      })
    }

    // Every error Directus *did* report is swallowed: an already-registered
    // address must be indistinguishable from a new one, or the form becomes a
    // way to test which of your customers has an account. The person who owns
    // the address learns what happened from the mail — or its absence.
  }

  setResponseStatus(event, 204)
})
