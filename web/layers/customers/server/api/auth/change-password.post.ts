import { updateMe } from "@directus/sdk"
import { z } from "zod"

const ChangeSchema = z.object({
  password: z.string().min(PASSWORD_MIN_LENGTH, { error: authMessages.passwordTooShort }),
})

export default defineEventHandler(async (event) => {
  // The Student's own session token, never the registration service token:
  // Directus decides whose password this may touch (R-5).
  const client = await getDirectusServerClient(event)
  if (client === null) {
    throw authError(401, "not_logged_in", authMessages.notLoggedIn)
  }

  const body: unknown = await readBody(event).catch(() => undefined)
  const parsed = ChangeSchema.safeParse(body)
  if (!parsed.success) {
    throw authError(
      400,
      "invalid_password",
      parsed.error.issues[0]?.message ?? authMessages.unexpected,
    )
  }

  try {
    await client.request(updateMe({ password: parsed.data.password }))
  } catch (error) {
    console.error("Directus refused a password change", error)
    throw authError(502, "change_password_failed", authMessages.unexpected)
  }

  return { message: authMessages.passwordChanged }
})
