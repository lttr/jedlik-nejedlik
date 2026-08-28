import { describe, expect, it } from "vitest"

// The real shipped export: this is the client-side half of the instance's
// password policy, so the thing under test has to be the thing that runs.
import { PASSWORD_MIN_LENGTH, validatePassword } from "../../layers/auth/shared/utils/password"

describe("validatePassword", () => {
  // The instance policy is `/^.{8,}$/`: a length and nothing else, so nothing
  // about the character mix may make a long enough password fail.
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

  // The message quotes the number, so it has to come from the same constant
  // the check uses — otherwise the two drift apart silently.
  it("names the minimum length in its Czech message", () => {
    expect(validatePassword("x")).toContain(String(PASSWORD_MIN_LENGTH))
  })
})
