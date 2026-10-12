import { describe, expect, it } from "vite-plus/test"
import { z } from "zod"

import { readValidBody } from "#layers/base/server/utils/valid-body"
import { requestEvent } from "./request-event"

const Schema = z.object({ email: z.email(), password: z.string().min(1) })

function post(body: string, contentType = "application/json") {
  return requestEvent("/api/auth/login", {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  })
}

describe("readValidBody", () => {
  const refusal = new Error("Neplatný e-mail nebo heslo.")

  it("passes a valid body through", async () => {
    const body = { email: "student@example.com", password: "heslo" }
    await expect(readValidBody(post(JSON.stringify(body)), Schema, refusal)).resolves.toEqual(body)
  })

  it.each([
    ["a missing field", JSON.stringify({ email: "student@example.com" })],
    ["a wrong type", JSON.stringify({ email: "student@example.com", password: 7 })],
    ["an empty body", ""],
    ["a body that is not JSON", "email=student@example.com&password"],
    ["a truncated JSON body", '{"email":'],
  ])("throws the route's own error, unchanged, for %s", async (_label, body) => {
    await expect(readValidBody(post(body), Schema, refusal)).rejects.toBe(refusal)
  })

  it("lets the route build its error from what failed", async () => {
    const body = JSON.stringify({ email: "student@example.com", password: "" })
    const failedField = readValidBody(
      post(body),
      Schema,
      (error) => new Error(String(error.issues[0]?.path[0])),
    )
    await expect(failedField).rejects.toThrow("password")
  })
})
