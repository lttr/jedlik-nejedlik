import { login, readMe } from "@directus/sdk"

import { credentialsSchema } from "../../../shared/utils/auth"

// Native Directus email+password login in `json` mode. Directus returns the
// token pair in the body; we stash it in httpOnly cookies and hand the client
// only the resolved user.
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (input) => credentialsSchema.parse(input))

  let accessToken: string
  try {
    const auth = await getDirectusRest(event).request(
      login({ email: body.email, password: body.password }, { mode: "json" }),
    )
    if (auth.access_token === null || auth.access_token === "") {
      throw new Error("no access token")
    }
    setAuthCookies(event, auth)
    accessToken = auth.access_token
  } catch {
    throw createError({ statusCode: 401, message: "Nesprávný e-mail nebo heslo." })
  }

  const me = await clientWithToken(event, accessToken).request(
    readMe({ fields: ["id", "email", "first_name", "last_name"] }),
  )
  return { user: toSessionUser(me) }
})
