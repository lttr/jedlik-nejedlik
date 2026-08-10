import { describe, expect, it } from "vitest"

import { scrubSensitiveParams } from "../../sentry-scrub"
import { redactSensitiveParams } from "../../shared/utils/redact"

describe("redactSensitiveParams", () => {
  it("redacts a reset token in a full URL", () => {
    expect(redactSensitiveParams("https://www.jedlik-nejedlik.cz/nove-heslo?token=abc123")).toBe(
      "https://www.jedlik-nejedlik.cz/nove-heslo?token=[redacted]",
    )
  })

  it("redacts a verification token that is not the first parameter", () => {
    expect(redactSensitiveParams("/registrace/overeni?utm=mail&token=abc123")).toBe(
      "/registrace/overeni?utm=mail&token=[redacted]",
    )
  })

  it("redacts a bare query string with no leading question mark", () => {
    expect(redactSensitiveParams("token=abc123&utm=mail")).toBe("token=[redacted]&utm=mail")
  })

  it("stops at the fragment rather than swallowing it", () => {
    expect(redactSensitiveParams("/nove-heslo?token=abc123#form")).toBe(
      "/nove-heslo?token=[redacted]#form",
    )
  })

  it("redacts every occurrence", () => {
    expect(redactSensitiveParams("/a?token=one&b=2&token=two")).toBe(
      "/a?token=[redacted]&b=2&token=[redacted]",
    )
  })

  it("matches case-insensitively, as query keys reach us unnormalised", () => {
    expect(redactSensitiveParams("/a?Token=abc123")).toBe("/a?Token=[redacted]")
  })

  it("handles an empty value without corrupting the rest", () => {
    expect(redactSensitiveParams("/a?token=&b=2")).toBe("/a?token=[redacted]&b=2")
  })

  it("leaves parameters that merely contain the word alone", () => {
    expect(redactSensitiveParams("/a?csrf_token_name=public&tokenized=1")).toBe(
      "/a?csrf_token_name=public&tokenized=1",
    )
  })

  it("leaves a URL without sensitive parameters untouched", () => {
    const url = "https://www.jedlik-nejedlik.cz/clanky?strana=2"
    expect(redactSensitiveParams(url)).toBe(url)
  })
})

describe("scrubSensitiveParams", () => {
  it("redacts the token everywhere a Sentry event can carry it", () => {
    const event = {
      request: {
        url: "https://www.jedlik-nejedlik.cz/nove-heslo?token=secret",
        query_string: "token=secret",
      },
      transaction: "/nove-heslo?token=secret",
      breadcrumbs: [
        { data: { url: "/registrace/overeni?token=secret" } },
        { data: { url: "/clanky" } },
        { data: undefined },
      ],
    }

    const scrubbed = scrubSensitiveParams(event)

    expect(scrubbed.request.url).toBe("https://www.jedlik-nejedlik.cz/nove-heslo?token=[redacted]")
    expect(scrubbed.request.query_string).toBe("token=[redacted]")
    expect(scrubbed.transaction).toBe("/nove-heslo?token=[redacted]")
    expect(scrubbed.breadcrumbs[0]?.data?.url).toBe("/registrace/overeni?token=[redacted]")
    expect(scrubbed.breadcrumbs[1]?.data?.url).toBe("/clanky")
    expect(JSON.stringify(scrubbed)).not.toContain("secret")
  })

  it("survives an event with none of the optional fields", () => {
    expect(scrubSensitiveParams({})).toEqual({})
  })
})
