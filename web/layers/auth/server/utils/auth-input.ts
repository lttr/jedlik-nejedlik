import type { H3Event } from "h3"
import { z } from "zod"

// The boundary that has to hold: every address reaches Directus in this one
// shape (see normaliseEmail), whatever the browser sent.
export const StudentEmail = z.string().transform(normaliseEmail).pipe(z.email())

// Each route picks its own error for a malformed body, so the reply reveals no
// more than that route's genuine failure would.
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

export function assertPasswordPolicy(password: string): void {
  const complaint = validatePassword(password)
  if (complaint !== null) {
    throw authError(400, "invalid_password", complaint)
  }
}
