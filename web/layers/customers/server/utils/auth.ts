// Shared plumbing for the auth Nitro routes. Every credential crosses this
// boundary and nothing below it ever reaches the browser (ADR 0002).
import { createUser, login, readMe } from "@directus/sdk"
import type { AuthenticationData } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

// Czech goes in `message`; `statusMessage` becomes the HTTP reason phrase,
// which must stay ASCII.
export function authError(statusCode: number, code: string, message: string): Error {
  return createError({ statusCode, statusMessage: code, message })
}

// Every Student the app creates gets this role, and the service user's
// policy allows no other — a bug here cannot mint a privileged user.
// Mirrors directus/config/collections/roles.json.
const STUDENT_ROLE_ID = "186fdb62-3231-4322-8491-2c3dd8124842"

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

// Registration may be specific about what is wrong: unlike login, it has
// nothing to hide — the duplicate-e-mail case is the whole point.
const RegistrationSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: authMessages.emailInvalid })),
  password: z.string().min(PASSWORD_MIN_LENGTH, { error: authMessages.passwordTooShort }),
})

export async function readRegistration(event: H3Event): Promise<Credentials> {
  const body: unknown = await readBody(event).catch(() => undefined)
  const parsed = RegistrationSchema.safeParse(body)
  if (!parsed.success) {
    throw authError(
      400,
      "invalid_registration",
      parsed.error.issues[0]?.message ?? authMessages.unexpected,
    )
  }
  return parsed.data
}

// Shape of a rejected @directus/sdk request: the parsed Directus error body.
const DirectusErrors = z.object({
  errors: z.array(z.object({ extensions: z.object({ code: z.string() }) })).min(1),
})

function directusErrorCode(error: unknown): string | undefined {
  const parsed = DirectusErrors.safeParse(error)
  return parsed.success ? parsed.data.errors[0]?.extensions.code : undefined
}

export async function createStudent(
  event: H3Event,
  { email, password }: Credentials,
): Promise<void> {
  const config = useRuntimeConfig(event)
  const service = createDirectusTokenClient(config.public.directusUrl, config.directusServiceToken)

  try {
    await service.request(
      createUser({ email, password, role: STUDENT_ROLE_ID, provider: "default" }),
    )
  } catch (error) {
    if (directusErrorCode(error) === "RECORD_NOT_UNIQUE") {
      throw authError(409, "email_taken", authMessages.emailTaken)
    }
    console.error("Directus refused to create a Student", error)
    throw authError(502, "registration_failed", authMessages.unexpected)
  }
}
