import { describe, expect, it } from "vitest"

import { DEFAULT_AUTH_REDIRECT, safeRedirectPath } from "../../layers/auth/shared/utils/redirects"

describe("safeRedirectPath", () => {
  it("keeps a same-origin path with its query and hash", () => {
    expect(safeRedirectPath("/kurzy/vyziva?tab=obsah#lekce-2")).toBe(
      "/kurzy/vyziva?tab=obsah#lekce-2",
    )
  })

  it("normalises a path that traverses above the root", () => {
    expect(safeRedirectPath("/a/../../etc/passwd")).toBe("/etc/passwd")
  })

  it.each([
    ["protocol-relative", "//evil.tld/path"],
    ["backslash protocol-relative", String.raw`/\evil.tld`],
    ["mixed slash and backslash", String.raw`/\/evil.tld`],
    ["absolute http URL", "https://evil.tld/path"],
    ["absolute URL on our own scheme-less host", "//www.jedlik-nejedlik.cz/muj-ucet"],
    ["javascript scheme", "javascript:alert(1)"],
    ["data scheme", "data:text/html,<script>alert(1)</script>"],
    ["embedded tab", "/\t/evil.tld"],
  ])("falls back to the account page for %s", (_label, raw) => {
    expect(safeRedirectPath(raw)).toBe(DEFAULT_AUTH_REDIRECT)
  })

  // The URL parser strips or percent-encodes these; the result is still an
  // unambiguous same-origin path, so a legitimate return is not thrown away.
  it.each([
    ["a stripped newline", "/muj-ucet\n//evil.tld", "/muj-ucet//evil.tld"],
    ["an encoded null byte", "/muj-ucet\u0000x", "/muj-ucet%00x"],
  ])("keeps %s on our own origin", (_label, raw, expected) => {
    expect(safeRedirectPath(raw)).toBe(expected)
  })

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["an empty string", ""],
    ["a number", 42],
    ["an array of strings", ["/a", "/b"]],
    ["an object", { path: "/a" }],
  ])("falls back to the account page for %s", (_label, raw) => {
    expect(safeRedirectPath(raw)).toBe(DEFAULT_AUTH_REDIRECT)
  })
})
