import { passwordRequest } from "@directus/sdk"

// Ask Directus to mail a reset link. The link points at our own /nove-heslo
// page, so the Student never lands on a Directus URL — Directus checks it
// against PASSWORD_RESET_URL_ALLOW_LIST (spec decision 3).

export default defineEventHandler(async (event) => {
  const parsed = PasswordRequestSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Zadejte prosím platnou e-mailovou adresu.",
    })
  }

  try {
    await getServerDirectusClient().request(
      passwordRequest(parsed.data.email, siteUrlFor(event, PASSWORD_RESET_PATH)),
    )
  } catch (error) {
    swallowRejection(error, "Obnova hesla")
  }

  setResponseStatus(event, 204)
})
