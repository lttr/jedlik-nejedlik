import { readBody } from "nuxt/server"
import type { RequestEvent } from "nuxt/server"
import type { z } from "zod"

// A fixed error, or a function that picks one from the failed fields.
export type InvalidBody = Error | ((error: z.ZodError) => Error)

// Each route picks its own error for a malformed body, so the reply reveals no
// more than that route's genuine failure would. A body that is not JSON at
// all is malformed like any other.
export async function readValidBody<T>(
  event: RequestEvent,
  schema: z.ZodType<T>,
  invalid: InvalidBody,
): Promise<T> {
  const body: unknown = await readBody(event).catch(() => undefined)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw typeof invalid === "function" ? invalid(parsed.error) : invalid
  }
  return parsed.data
}
