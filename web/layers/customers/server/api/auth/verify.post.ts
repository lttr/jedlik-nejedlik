import { registerUserVerify } from "@directus/sdk"

// Second half of registration: the token from Directus's verification e-mail,
// posted back by our own /registrace/overeni page. Creates no session — we
// never held the password, so the Student signs in afterwards.

export default defineEventHandler(async (event) => {
  const parsed = TokenSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Odkaz pro ověření je neúplný. Otevřete prosím odkaz z e-mailu znovu.",
    })
  }

  try {
    await getServerDirectusClient().request(registerUserVerify(parsed.data.token))
  } catch (error) {
    const code = directusErrorCode(error)
    // An expired or already-used link is the common case and has an obvious
    // next step, so it gets its own message rather than a generic failure.
    if (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN" || code === "INVALID_PAYLOAD") {
      throw createError({
        statusCode: 410,
        statusMessage: "Gone",
        message:
          "Platnost odkazu vypršela, nebo už byl použit. Zkuste se přihlásit — pokud to nepůjde, zaregistrujte se prosím znovu.",
      })
    }
    // Includes the no-code case, where Directus never answered at all — the
    // Student should retry rather than conclude the link is dead.
    throw createError({
      statusCode: 502,
      statusMessage: "Bad Gateway",
      message: "Ověření se nezdařilo. Zkuste to prosím znovu později.",
    })
  }

  setResponseStatus(event, 204)
})
