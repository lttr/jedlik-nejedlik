import { describe, expect, it } from "vitest"

import { authRedirectTarget, DEFAULT_AUTH_REDIRECT } from "#layers/auth/shared/utils/redirects"
import {
  checkoutSlugFromPath,
  pendingCheckoutPath,
} from "#layers/base/shared/utils/pending-checkout"

// The cookie is set on an unauthenticated request and read back on another
// one, so everything it can do is decided by these three functions.

describe("pendingCheckoutPath", () => {
  it("turns a stored slug into that Course's Checkout", () => {
    expect(pendingCheckoutPath("jak-naucit-dite-jist")).toBe("/objednavka/jak-naucit-dite-jist")
  })

  it.each([
    ["nothing stored", null],
    ["an empty cookie", ""],
    ["a non-string", 7],
    ["a path", "/objednavka/kurz"],
    ["a slug with a slash", "kurz/../../etc"],
    ["an absolute URL", "https://evil.tld/kurz"],
    ["a protocol-relative URL", "//evil.tld"],
    ["a slug with a query", "kurz?next=//evil.tld"],
    ["a slug with a dot", "kurz.html"],
    ["a slug with a backslash", String.raw`\evil.tld`],
    ["a slug longer than any Course's", "k".repeat(101)],
  ])("refuses %s", (_label, raw) => {
    expect(pendingCheckoutPath(raw)).toBeNull()
  })
})

describe("checkoutSlugFromPath", () => {
  it.each([
    ["the Checkout page", "/objednavka/kurz"],
    ["the Checkout page with a query", "/objednavka/kurz?overeno=1"],
    ["the Checkout route", "/api/checkout/kurz"],
  ])("remembers %s", (_label, path) => {
    expect(checkoutSlugFromPath(path)).toBe("kurz")
  })

  it.each([
    ["the return page", "/objednavka/12/navrat?id=3"],
    ["the Catalog", "/kurzy"],
    ["the Sales Page", "/kurzy/kurz"],
    ["the notification route", "/api/gopay/notify?id=3"],
    ["the Checkout's parent", "/objednavka"],
  ])("leaves %s alone", (_label, path) => {
    expect(checkoutSlugFromPath(path)).toBeNull()
  })
})

describe("authRedirectTarget", () => {
  it("prefers an explicit redirect over the pending Checkout", () => {
    expect(authRedirectTarget("/kurzy/vyziva", "kurz")).toBe("/kurzy/vyziva")
  })

  it("falls back to the pending Checkout", () => {
    expect(authRedirectTarget(undefined, "kurz")).toBe("/objednavka/kurz")
  })

  it("falls back to the Account page with neither", () => {
    expect(authRedirectTarget("", null)).toBe(DEFAULT_AUTH_REDIRECT)
  })

  // The auth layer's rules still decide: the cookie is no way around them.
  it.each([
    ["a query pointing at another host", "https://evil.tld/muj-ucet", null],
    ["a protocol-relative query", "//evil.tld", null],
    ["a javascript: query", "javascript:alert(1)", null],
    ["a cookie pointing at another host", undefined, "https://evil.tld"],
    ["a cookie holding a protocol-relative URL", undefined, "//evil.tld"],
  ])("refuses %s", (_label, rawRedirect, pendingSlug) => {
    expect(authRedirectTarget(rawRedirect, pendingSlug)).toBe(DEFAULT_AUTH_REDIRECT)
  })
})
