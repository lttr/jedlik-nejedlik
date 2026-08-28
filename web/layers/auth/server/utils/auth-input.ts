// Reading an auth route's JSON body: one function, one schema per route.
import type { H3Event } from "h3"
import { z } from "zod"

// The one shape an address may reach Directus in (see normaliseEmail). The
// browser normalises too, so that the confirmation names the address that was
// actually registered — but this is the boundary that has to hold.
export const StudentEmail = z.string().transform(normaliseEmail).pipe(z.email())

// Every auth route answers a malformed body with an error of its own choosing,
// so that the reply says no more than that route's genuine failure would.
export async function readAuthBody<T>(
  event: H3Event,
  schema: z.ZodType<T>,
  invalid: Error,
): Promise<T> {
  const body: unknown = await readBody(event).catch(() => undefined)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw invalid
  }
  return parsed.data
}

// The instance's password policy, as a route-level rejection. Shared by every
// route that sets a password — registration, reset completion and change —
// so the rule, the status and the Czech wording stay one thing.
export function assertPasswordPolicy(password: string): void {
  const complaint = validatePassword(password)
  if (complaint !== null) {
    throw authError(400, "invalid_password", complaint)
  }
}
