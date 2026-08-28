// Registration and e-mail verification, both proxied to Directus's native
// public-registration endpoints (ADR 0002). The app holds no credential that
// can create a user: the instance assigns the role from
// `public_registration_role`, so no role id appears anywhere in source.
import { registerUser, registerUserVerify } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

import type { Credentials } from "../../shared/types/student"

// The password is checked against the same rule the form uses, so the two can
// never disagree; the e-mail is normalised by StudentEmail.
const RegistrationSchema = z.object({
  email: StudentEmail,
  password: z.string(),
})

const VerificationSchema = z.object({ token: z.string().min(1) })

export async function readRegistration(event: H3Event): Promise<Credentials> {
  const registration = await readAuthBody(
    event,
    RegistrationSchema,
    authError(400, "invalid_email", authMessages.invalidEmail),
  )
  assertPasswordPolicy(registration.password)
  return registration
}

export async function readVerificationToken(event: H3Event): Promise<string> {
  // A missing token is a dead link like any other, and says the same thing.
  const { token } = await readAuthBody(
    event,
    VerificationSchema,
    authError(400, "invalid_token", authMessages.verificationFailed),
  )
  return token
}

// Directus answers 204 whether the address was free or already taken — by
// design, so accounts stay unenumerable. Nothing here can tell the two apart,
// and the page's confirmation is written to cover both.
export async function registerStudent(event: H3Event, registration: Credentials): Promise<void> {
  try {
    await getDirectusAnonymousServerClient(event).request(
      registerUser(registration.email, registration.password, {
        // The instance only accepts a `verification_url` named in its own
        // USER_REGISTER_URL_ALLOW_LIST; anything else is 400 INVALID_PAYLOAD.
        verification_url: authPageUrl(event, VERIFY_EMAIL_PATH),
      }),
    )
  } catch (error) {
    throw unexpectedAuthError(
      "Directus rejected a registration",
      error,
      authMessages.registrationUnavailable,
    )
  }
}

// Consumes the token from the verification e-mail: the account flips from
// Unverified to Active and can log in. Expired, already used, or forged all
// come back as 403 INVALID_TOKEN (measured), which is one message to a
// Student — the page offers the routes onward.
export async function verifyStudentEmail(event: H3Event, token: string): Promise<void> {
  try {
    await getDirectusAnonymousServerClient(event).request(registerUserVerify(token))
  } catch (error) {
    if (directusErrorCode(error) === "INVALID_TOKEN") {
      throw authError(400, "invalid_token", authMessages.verificationFailed)
    }
    throw unexpectedAuthError(
      "Directus rejected an e-mail verification",
      error,
      authMessages.verificationUnavailable,
    )
  }
}
