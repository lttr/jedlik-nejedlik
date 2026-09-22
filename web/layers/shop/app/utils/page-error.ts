// A 404 is worded like Nuxt's own route miss, so a draft cannot be told apart
// from a URL that never existed (ADR 0004). `fatal` covers client navigations.
export function throwPageError(
  error: { statusCode?: number; statusMessage?: string },
  path: string,
): never {
  throw createError({
    statusCode: error.statusCode ?? 500,
    statusMessage: error.statusCode === 404 ? `Page not found: ${path}` : error.statusMessage,
    fatal: true,
  })
}
