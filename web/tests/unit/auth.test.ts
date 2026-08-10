import { describe, expect, it } from "vitest"

import {
  LoginSchema,
  authErrorMessage,
  safeNextPath,
} from "../../layers/customers/shared/utils/auth"

describe("LoginSchema", () => {
  it("normalises the e-mail so one address cannot become two accounts", () => {
    const parsed = LoginSchema.parse({ email: "  Zdenka@Example.CZ ", password: "tajneheslo" })
    expect(parsed.email).toBe("zdenka@example.cz")
  })

  it("rejects a malformed e-mail", () => {
    expect(LoginSchema.safeParse({ email: "zdenka", password: "tajneheslo" }).success).toBe(false)
  })

  it("rejects an empty password without imposing the length policy", () => {
    expect(LoginSchema.safeParse({ email: "z@example.cz", password: "" }).success).toBe(false)
    expect(LoginSchema.safeParse({ email: "z@example.cz", password: "krátké" }).success).toBe(true)
  })
})

describe("safeNextPath", () => {
  it("keeps a same-site path", () => {
    expect(safeNextPath("/ucet/objednavky")).toBe("/ucet/objednavky")
  })

  it.each<[unknown, string]>([
    ["https://evil.tld", "absolute URL"],
    ["//evil.tld", "protocol-relative URL"],
    ["/\\evil.tld", "backslash smuggled into a path"],
    ["ucet", "relative path with no leading slash"],
    [undefined, "missing value"],
    [["/ucet"], "non-string value"],
  ])("falls back for %s (%s)", (next) => {
    expect(safeNextPath(next)).toBe("/ucet")
  })

  it("honours an explicit fallback", () => {
    expect(safeNextPath("https://evil.tld", "/prihlaseni")).toBe("/prihlaseni")
  })
})

describe("authErrorMessage", () => {
  it("surfaces the message a server route set", () => {
    expect(authErrorMessage({ data: { message: "Nesprávný e-mail nebo heslo." } })).toBe(
      "Nesprávný e-mail nebo heslo.",
    )
  })

  it.each<[unknown, string]>([
    [{ data: { message: "" } }, "empty message"],
    [{ data: {} }, "no message key"],
    [{}, "no data"],
    [null, "no error object"],
    [new Error("boom"), "a plain Error"],
  ])("falls back for %o (%s)", (error) => {
    expect(authErrorMessage(error)).toBe("Omlouváme se, něco se pokazilo. Zkuste to prosím znovu.")
  })
})
