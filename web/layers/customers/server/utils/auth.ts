// Shared plumbing for the auth Nitro routes. Every credential crosses this
// boundary and nothing below it ever reaches the browser (ADR 0002).
import { login, readMe } from "@directus/sdk"
import type { AuthenticationData } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

// Czech goes in `message`; `statusMessage` becomes the HTTP reason phrase,
// which must stay ASCII.
export function authError(statusCode: number, code: string, message: string): Error {
  return createError({ statusCode, statusMessage: code, message })
}

const CredentialsSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(1),
})

export interface Credentials {
  email: string
  password: string
}

// A malformed login payload answers exactly like a wrong password: telling
// the two apart is the first step of enumerating accounts.
export async function readCredentials(event: H3Event): Promise<Credentials> {
  const body: unknown = await readBody(event).catch(() => undefined)
  const parsed = CredentialsSchema.safeParse(body)
  if (!parsed.success) {
    throw authError(401, "invalid_credentials", authMessages.invalidCredentials)
  }
  return parsed.data
}

export async function loginToDirectus(
  event: H3Event,
  { email, password }: Credentials,
): Promise<AuthenticationData> {
  try {
    return await getDirectusAnonymousServerClient(event).request(
      login({ email, password }, { mode: "json" }),
    )
  } catch {
    // Wrong password, unknown e-mail and a user suspended by Directus's
    // login-attempt limiting are one and the same answer here.
    throw authError(401, "invalid_credentials", authMessages.invalidCredentials)
  }
}

// The logged-in Student, or null when this request carries no live session.
export async function readStudent(event: H3Event): Promise<Student | null> {
  const client = await getDirectusServerClient(event)
  if (client === null) {
    return null
  }

  try {
    const me = await client.request(readMe({ fields: ["id", "email"] }))
    return typeof me.email === "string" ? { id: me.id, email: me.email } : null
  } catch (error) {
    // A live session that cannot read its own row means the Student policy is
    // missing its `directus_users` read permission — loud, not silent.
    console.error("Directus rejected readMe for a live session", error)
    return null
  }
}
