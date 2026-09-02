import { describe, expect, it } from "vitest"

import { authFailure } from "../../layers/auth/app/utils/auth-errors"
import { authMessages } from "../../layers/auth/shared/utils/auth-messages"

// The shape Nitro gives a rejected `$fetch`.
function nitroRejection(message: string, statusMessage?: string) {
  return { data: { url: "/api/auth/password-reset", statusCode: 400, message, statusMessage } }
}

describe("authFailure", () => {
  it("takes the Czech message and the route's code from a Nitro error", () => {
    expect(authFailure(nitroRejection(authMessages.resetFailed, "invalid_token"))).toEqual({
      message: authMessages.resetFailed,
      code: "invalid_token",
    })
  })

  // /obnova-hesla branches on `invalid_token`, so the code has to survive.
  it("keeps the code distinct from the message", () => {
    const dead = authFailure(nitroRejection(authMessages.resetFailed, "invalid_token"))
    const limited = authFailure(nitroRejection(authMessages.tooManyResets, "rate_limited"))
    expect(dead.code).not.toBe(limited.code)
  })

  it("reports no code when the error carries no statusMessage", () => {
    expect(authFailure(nitroRejection(authMessages.invalidCredentials))).toEqual({
      message: authMessages.invalidCredentials,
      code: "",
    })
  })

  it.each([
    ["a network failure", new TypeError("Failed to fetch")],
    ["a body with no message", { data: { statusCode: 500 } }],
    ["an empty message", { data: { message: "" } }],
    ["nothing at all", undefined],
  ])("falls back to the generic sentence for %s", (_label, error) => {
    expect(authFailure(error)).toEqual({ message: authMessages.unexpected, code: "" })
  })
})
