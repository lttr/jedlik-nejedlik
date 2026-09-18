// A Nitro refusal that the page has no better answer for, turned into the
// site's error page. Three shop pages need the same two rules, so they say it
// once: a 404 is worded like Nuxt's own route miss — a draft or somebody
// else's Order must not be distinguishable from a URL that never existed
// (ADR 0004) — and `fatal` makes a client-side navigation show the error page
// too, not only a server render.
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
