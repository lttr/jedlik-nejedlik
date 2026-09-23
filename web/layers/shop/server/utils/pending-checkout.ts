import type { H3Event } from "h3"

import {
  PENDING_CHECKOUT_COOKIE,
  PENDING_CHECKOUT_MAX_AGE,
} from "#layers/shop/shared/utils/pending-checkout"

// The pending-checkout cookie's three moves. `httpOnly`, because nothing in
// the browser has any business reading or writing it; `lax`, because the
// verification link arrives as a top-level navigation from a mail client.

export function setPendingCheckout(event: H3Event, slug: string): void {
  setCookie(event, PENDING_CHECKOUT_COOKIE, slug, {
    maxAge: PENDING_CHECKOUT_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: !import.meta.dev,
  })
}

// Only ever cleared when there is something to clear: a `Set-Cookie` on every
// Checkout request of every logged-in Student would be noise.
export function clearPendingCheckout(event: H3Event): void {
  if (getCookie(event, PENDING_CHECKOUT_COOKIE) !== undefined) {
    deleteCookie(event, PENDING_CHECKOUT_COOKIE, { path: "/" })
  }
}

// Read and clear in one move: the cookie exists to survive exactly one trip
// to the inbox, and leaving it behind would send the next login to a Checkout
// nobody asked for.
export function takePendingCheckout(event: H3Event): string | null {
  const slug = getCookie(event, PENDING_CHECKOUT_COOKIE) ?? null
  clearPendingCheckout(event)
  return slug
}
