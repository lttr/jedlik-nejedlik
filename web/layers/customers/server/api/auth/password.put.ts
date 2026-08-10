import { passwordReset } from "@directus/sdk"

// Set a new password from the token in Directus's reset mail.
//
// No session is created and any existing one is left alone: Directus
// invalidates the account's refresh tokens on reset, so a stale session here
// would fail on its next Directus call anyway. The Student signs in with the
// new password, which also proves it works.

export default defineEventHandler(async (event) => {
  const parsed = PasswordResetSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    // Which field failed changes what the Student should do: fix the password,
    // or open the link again. Telling them the password is too short when the
    // token is missing sends them in circles.
    const tokenFailed = parsed.error.issues.some((issue) => issue.path[0] === "token")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: tokenFailed
        ? "Odkaz pro obnovu hesla je neúplný. Otevřete prosím odkaz z e-mailu znovu."
        : `Heslo musí mít alespoň ${PASSWORD_MIN_LENGTH} znaků.`,
    })
  }

  try {
    await getServerDirectusClient().request(passwordReset(parsed.data.token, parsed.data.password))
  } catch (error) {
    const code = directusErrorCode(error)

    if (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN" || code === "INVALID_PAYLOAD") {
      throw createError({
        statusCode: 410,
        statusMessage: "Gone",
        message:
          "Platnost odkazu vypršela, nebo už byl použit. Vyžádejte si prosím nový odkaz pro obnovu hesla.",
      })
    }

    throw createError({
      statusCode: 502,
      statusMessage: "Bad Gateway",
      message: "Nastavení nového hesla se nezdařilo. Zkuste to prosím znovu později.",
    })
  }

  setResponseStatus(event, 204)
})
