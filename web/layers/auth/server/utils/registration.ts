// Proxied to Directus's native public-registration endpoints. The instance
// assigns the role from `public_registration_role`, so no role id appears in
// source.
import { registerUser, registerUserVerify } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

import type { Credentials } from "../../shared/types/student"

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
  // A missing token is a dead link like any other.
  const { token } = await readAuthBody(
    event,
    VerificationSchema,
    authError(400, "invalid_token", authMessages.verificationFailed),
  )
  return token
}

// Directus answers 204 whether the address was free or already taken, so
// accounts stay unenumerable; the page's confirmation is written for both.
export async function registerStudent(event: H3Event, registration: Credentials): Promise<void> {
  try {
    await getDirectusAnonymousServerClient(event).request(
      registerUser(registration.email, registration.password, {
        // Must be on the instance's USER_REGISTER_URL_ALLOW_LIST, else 400.
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

// Expired, already used and forged tokens all come back as 403 INVALID_TOKEN
// (probe), which is one message to the Student.
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
