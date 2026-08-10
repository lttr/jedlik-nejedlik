import type { AuthenticationData } from "@directus/sdk"
import { describe, expect, it } from "vitest"

import {
  TOKEN_REFRESH_SKEW_MS,
  directusErrorCode,
  isTokenStale,
  sessionTokensFrom,
} from "../../layers/customers/server/utils/auth"

const NOW = 1_800_000_000_000

function authData(overrides: Partial<AuthenticationData> = {}): AuthenticationData {
  return {
    access_token: "access",
    refresh_token: "refresh",
    expires: 900_000,
    expires_at: null,
    ...overrides,
  }
}

describe("isTokenStale", () => {
  it("is fresh while more than the skew remains", () => {
    expect(isTokenStale(NOW + TOKEN_REFRESH_SKEW_MS + 1, NOW)).toBe(false)
  })

  it("is stale once inside the skew, before the token actually expires", () => {
    expect(isTokenStale(NOW + TOKEN_REFRESH_SKEW_MS, NOW)).toBe(true)
    expect(isTokenStale(NOW + 1, NOW)).toBe(true)
  })

  it("is stale after expiry", () => {
    expect(isTokenStale(NOW - 1, NOW)).toBe(true)
  })
})

describe("sessionTokensFrom", () => {
  it("prefers the absolute expiry Directus sends", () => {
    const tokens = sessionTokensFrom(authData({ expires_at: NOW + 60_000 }), NOW)
    expect(tokens).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
      expiresAt: NOW + 60_000,
    })
  })

  it("derives an absolute expiry from the TTL when there is no expires_at", () => {
    expect(sessionTokensFrom(authData(), NOW)?.expiresAt).toBe(NOW + 900_000)
  })

  it.each<[Partial<AuthenticationData>, string]>([
    [{ access_token: null }, "no access token"],
    [{ refresh_token: null }, "no refresh token"],
    [{ expires: null, expires_at: null }, "no expiry at all"],
  ])("refuses to build a session from %o (%s)", (overrides) => {
    expect(sessionTokensFrom(authData(overrides), NOW)).toBeNull()
  })
})

describe("directusErrorCode", () => {
  it("reads the code off a Directus error response", () => {
    const error = {
      errors: [
        { message: "Invalid user credentials.", extensions: { code: "INVALID_CREDENTIALS" } },
      ],
    }
    expect(directusErrorCode(error)).toBe("INVALID_CREDENTIALS")
  })

  it.each<[unknown, string]>([
    [{ errors: [] }, "an empty errors array"],
    [{ errors: [{ message: "no extensions" }] }, "an error without extensions"],
    [{ errors: "nope" }, "a non-array errors field"],
    [new Error("network down"), "a plain Error"],
    [null, "nothing at all"],
  ])("returns undefined for %o (%s)", (error) => {
    expect(directusErrorCode(error)).toBeUndefined()
  })
})
