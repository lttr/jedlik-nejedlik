function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

// Pull the user-facing message out of a failed `$fetch` (Nitro puts our
// `createError({ message })` text on `error.data.message`), falling back to a
// generic Czech line.
export function authErrorMessage(error: unknown, fallback: string): string {
  const data = isObject(error) ? error.data : undefined
  const message = isObject(data) ? (data.message ?? data.statusMessage) : undefined
  return typeof message === "string" && message !== "" ? message : fallback
}
