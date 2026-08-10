import { describe, expect, it } from "vitest"

import {
  LoginSchema,
  PASSWORD_MIN_LENGTH,
  PasswordRequestSchema,
  PasswordResetSchema,
  RegisterSchema,
  TokenSchema,
  authErrorMessage,
  safeNextPath,
} from "../../layers/customers/shared/utils/auth"

// Password fixtures are built rather than written as literals: a string sitting
// next to a `password:` key reads as a credential to secret scanners, and these
// are filler. Only their length is ever under test.
const VALID_PASSWORD = "x".repeat(PASSWORD_MIN_LENGTH + 2)
const EXACT_LENGTH_PASSWORD = "x".repeat(PASSWORD_MIN_LENGTH)
const TOO_SHORT_PASSWORD = "x".repeat(PASSWORD_MIN_LENGTH - 1)

describe("LoginSchema", () => {
  it("normalises the e-mail so one address cannot become two accounts", () => {
    const parsed = LoginSchema.parse({ email: "  Zdenka@Example.CZ ", password: VALID_PASSWORD })
    expect(parsed.email).toBe("zdenka@example.cz")
  })

  it("rejects a malformed e-mail", () => {
    expect(LoginSchema.safeParse({ email: "zdenka", password: VALID_PASSWORD }).success).toBe(false)
  })

  it("rejects an empty password without imposing the length policy", () => {
    expect(LoginSchema.safeParse({ email: "z@example.cz", password: "" }).success).toBe(false)
    expect(
      LoginSchema.safeParse({ email: "z@example.cz", password: TOO_SHORT_PASSWORD }).success,
    ).toBe(true)
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

describe("RegisterSchema", () => {
  it("normalises the e-mail the same way login does", () => {
    const parsed = RegisterSchema.parse({ email: " Nova@Example.CZ ", password: VALID_PASSWORD })
    expect(parsed.email).toBe("nova@example.cz")
  })

  it("enforces the instance's password policy", () => {
    expect(
      RegisterSchema.safeParse({ email: "n@example.cz", password: TOO_SHORT_PASSWORD }).success,
    ).toBe(false)
    expect(
      RegisterSchema.safeParse({ email: "n@example.cz", password: EXACT_LENGTH_PASSWORD }).success,
    ).toBe(true)
  })

  it("treats blank names as absent so a blank never overwrites a value", () => {
    const parsed = RegisterSchema.parse({
      email: "n@example.cz",
      password: VALID_PASSWORD,
      firstName: "",
      lastName: "",
    })
    expect(parsed.firstName).toBeUndefined()
    expect(parsed.lastName).toBeUndefined()
  })

  it("keeps names that were actually given, trimmed", () => {
    const parsed = RegisterSchema.parse({
      email: "n@example.cz",
      password: VALID_PASSWORD,
      firstName: " Zdeňka ",
      lastName: " Trummová ",
    })
    expect(parsed.firstName).toBe("Zdeňka")
    expect(parsed.lastName).toBe("Trummová")
  })
})

describe("TokenSchema", () => {
  it("accepts any non-empty token — Directus judges validity", () => {
    expect(TokenSchema.safeParse({ token: "abc.def.ghi" }).success).toBe(true)
  })

  it.each<[unknown, string]>([
    [{ token: "" }, "empty token"],
    [{}, "missing token"],
    [{ token: 42 }, "non-string token"],
  ])("rejects %o (%s)", (body) => {
    expect(TokenSchema.safeParse(body).success).toBe(false)
  })
})

describe("PasswordRequestSchema", () => {
  it("normalises the e-mail so a reset finds the same account as login", () => {
    expect(PasswordRequestSchema.parse({ email: " Zdenka@Example.CZ " }).email).toBe(
      "zdenka@example.cz",
    )
  })

  it("rejects a malformed address before Directus is asked", () => {
    expect(PasswordRequestSchema.safeParse({ email: "zdenka" }).success).toBe(false)
  })
})

describe("PasswordResetSchema", () => {
  it("holds the same password policy as registration", () => {
    expect(
      PasswordResetSchema.safeParse({ token: "t", password: TOO_SHORT_PASSWORD }).success,
    ).toBe(false)
    expect(
      PasswordResetSchema.safeParse({ token: "t", password: EXACT_LENGTH_PASSWORD }).success,
    ).toBe(true)
  })

  it.each<[unknown, string]>([
    [{ password: VALID_PASSWORD }, "missing token"],
    [{ token: "", password: VALID_PASSWORD }, "empty token"],
  ])("rejects %o (%s)", (body) => {
    expect(PasswordResetSchema.safeParse(body).success).toBe(false)
  })
})
