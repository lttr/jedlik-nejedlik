import { safeRedirectPath } from "../../../auth/shared/utils/redirects"

// The Checkout a visitor without an Account left behind, so registering,
// walking to their inbox and following the verification link brings them back
// to the Course they were buying (ADR 0005). The cookie carries the Course
// slug and nothing else: it is set on an unauthenticated request, so it must
// say as little as possible, and every use of it is checked here.

export const PENDING_CHECKOUT_COOKIE = "pending-checkout"

// A day is long enough for „I will finish this after dinner" and short enough
// that a stale slug never surprises anyone (spec, „Checkout page").
export const PENDING_CHECKOUT_MAX_AGE = 60 * 60 * 24

// Deliberately about separators rather than about spelling: a slug the CMS
// accepts must not be refused here, while nothing that could turn a path into
// another target — a slash, a colon, a dot, a percent sign — may pass. That
// check is what makes a cookie the browser handed back safe to build a path
// from.
const SLUG = /^[\w-]{1,100}$/

export function checkoutPath(slug: string): string {
  return `/objednavka/${slug}`
}

// The Checkout a stored slug points at, or null for anything else — an empty
// cookie, a forged one, a slug with a scheme or a slash in it.
export function pendingCheckoutPath(slug: unknown): string | null {
  return typeof slug === "string" && SLUG.test(slug) ? checkoutPath(slug) : null
}

// Which Checkout a request is for, from its path alone: the page and the
// route that renders it. Anything deeper (`/objednavka/<id>/navrat`) is not a
// Checkout and must not set the cookie.
const CHECKOUT_REQUEST = /^\/(?:objednavka|api\/checkout)\/([^/?#]+)\/?(?:[?#].*)?$/

export function checkoutSlugFromPath(path: string): string | null {
  const slug = CHECKOUT_REQUEST.exec(path)?.[1]
  return slug !== undefined && SLUG.test(slug) ? slug : null
}

// Where an Account goes once they are logged in: an explicit `?redirect=`
// first, then the Checkout they were on, then the Account page. Both
// candidates go through the auth layer's own rules, so a foreign target is
// refused here exactly as it is on the login page.
export function authRedirectTarget(rawRedirect: unknown, pendingSlug: unknown): string {
  if (typeof rawRedirect === "string" && rawRedirect !== "") {
    return safeRedirectPath(rawRedirect)
  }
  return safeRedirectPath(pendingCheckoutPath(pendingSlug))
}
