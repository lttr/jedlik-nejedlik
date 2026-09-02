import { describe, expect, it } from "vitest"

import { PASSWORD_MIN_LENGTH, validatePassword } from "../../layers/auth/shared/utils/password"

describe("validatePassword", () => {
  // The instance policy is a length and nothing else: the character mix must
  // never make a long enough password fail.
  it.each([
    ["exactly the minimum length", "a".repeat(PASSWORD_MIN_LENGTH)],
    ["a longer password", "dost-dlouhé-heslo"],
    ["spaces", "        "],
    ["diacritics", "ěščřžýáíé"],
  ])("accepts %s", (_label, password) => {
    expect(validatePassword(password)).toBeNull()
  })

  it("rejects a password one character short", () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH - 1))).not.toBeNull()
  })

  it("rejects an empty password", () => {
    expect(validatePassword("")).not.toBeNull()
  })

  // The message quotes the number; it must not drift from the constant.
  it("names the minimum length in its Czech message", () => {
    expect(validatePassword("x")).toContain(String(PASSWORD_MIN_LENGTH))
  })
})
