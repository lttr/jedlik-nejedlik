import { passwordReset } from "@directus/sdk"
import { z } from "zod"

const ResetSchema = z.object({
  token: z.string().min(1, { error: authMessages.resetLinkInvalid }),
  password: z.string().min(PASSWORD_MIN_LENGTH, { error: authMessages.passwordTooShort }),
})

export default defineEventHandler(async (event) => {
  const body: unknown = await readBody(event).catch(() => undefined)
  const parsed = ResetSchema.safeParse(body)
  if (!parsed.success) {
    throw authError(
      400,
      "invalid_reset",
      parsed.error.issues[0]?.message ?? authMessages.unexpected,
    )
  }

  try {
    await getDirectusAnonymousServerClient(event).request(
      passwordReset(parsed.data.token, parsed.data.password),
    )
  } catch (error) {
    // Expired, already spent, or never ours — one message covers all three,
    // and each of them ends the same way: ask for a fresh link.
    console.error("Directus rejected a password reset", error)
    throw authError(400, "reset_link_invalid", authMessages.resetLinkInvalid)
  }

  return { message: authMessages.passwordChanged }
})
