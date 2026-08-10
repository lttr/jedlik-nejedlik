import { login, readMe, withToken } from "@directus/sdk"

// Proxies Directus's native e-mail + password login (TO-2). Directus runs on
// another domain, so its tokens are captured here and sealed into our own
// session cookie instead of ever reaching the browser.

// One message for every rejection. Unknown e-mail, wrong password and
// unverified account must be indistinguishable, or the form becomes an oracle
// for which addresses have accounts.
const LOGIN_FAILED = "Nesprávný e-mail nebo heslo."

// Directus answered, but not with something we can build a session from. Never
// reported as a credentials problem — that would have the Student retype a
// password that was right all along.
function upstreamProblem(message: string) {
  return createError({ statusCode: 502, statusMessage: "Bad Gateway", message })
}

function rejectedLogin(error: unknown) {
  const code = directusErrorCode(error)

  if (code === "REQUESTS_EXCEEDED") {
    return createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
      message: "Příliš mnoho pokusů o přihlášení. Zkuste to prosím za chvíli.",
    })
  }

  // No Directus error code means Directus never answered — DNS, TLS, a network
  // policy, an outage. Reporting that as bad credentials would tell every
  // Student their password is wrong during an incident, and would send them to
  // the password-reset flow, which is down for the same reason.
  if (code === undefined) {
    return upstreamProblem("Přihlášení je dočasně nedostupné. Zkuste to prosím za chvíli.")
  }

  return createError({ statusCode: 401, statusMessage: "Unauthorized", message: LOGIN_FAILED })
}

export default defineEventHandler(async (event) => {
  const parsed = LoginSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: LOGIN_FAILED })
  }

  const client = getServerDirectusClient()

  let auth
  try {
    auth = await client.request(login(parsed.data, { mode: "json" }))
  } catch (error) {
    throw rejectedLogin(error)
  }

  const tokens = sessionTokensFrom(auth, Date.now())
  if (tokens === null) {
    throw upstreamProblem("Přihlášení se nezdařilo. Zkuste to prosím znovu.")
  }

  const me = await client.request(
    withToken(tokens.accessToken, readMe({ fields: ["id", "email", "first_name", "last_name"] })),
  )

  // Identity is the e-mail (O-17). Directus types it nullable because staff
  // accounts can exist without one; a Student that reached login always has it.
  if (me.email === null || me.email === undefined) {
    throw upstreamProblem("Účet nemá e-mailovou adresu. Ozvěte se nám prosím.")
  }

  await setUserSession(event, {
    user: {
      id: me.id,
      email: me.email,
      firstName: me.first_name ?? undefined,
      lastName: me.last_name ?? undefined,
    },
    secure: tokens,
  })
})
