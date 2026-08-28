import { afterAll, beforeAll, describe, expect, it } from "vitest"

import {
  errorCode,
  generatePassword,
  item,
  probe,
  probeSend,
  roleIdByName,
  roleToken,
} from "./support"

// The auth contract the Nitro session routes are built on (area 02): what
// Directus answers to login, refresh and logout, and — the open question the
// spec asked to settle empirically — whether an Unverified account is
// distinguishable from wrong credentials at the login endpoint.
//
// Everything here is externally observable HTTP behaviour: status codes,
// Directus error codes, token round-trips. Throwaway users are created and
// deleted by the admin token; their passwords are generated per run.
//
// Required environment (never committed):
//   DIRECTUS_PROBE_ADMIN_TOKEN   admin token (fixture creation + cleanup)

const ADMIN = roleToken("DIRECTUS_PROBE_ADMIN_TOKEN")

interface Fixture {
  id: string
  email: string
  password: string
}

let studentRole: string
const createdUsers: string[] = []

async function createStudent(status: "active" | "unverified"): Promise<Fixture> {
  const password = generatePassword()
  const email = `probe-auth-${Date.now()}-${status}@jedlik-nejedlik.cz`
  const response = await probeSend(
    "POST",
    "/users",
    { email, password, role: studentRole, status, provider: "default" },
    ADMIN,
  )
  if (response.status !== 200) {
    throw new Error(`Probe fixture setup failed: POST /users returned ${response.status}`)
  }
  const id = item(response).id as string
  createdUsers.push(id)
  return { id, email, password }
}

async function login(email: string, password: string) {
  return probeSend("POST", "/auth/login", { email, password, mode: "json" })
}

function tokens(response: { body: { data?: unknown } }): {
  access_token: string
  refresh_token: string
  expires: number
} {
  return response.body.data as { access_token: string; refresh_token: string; expires: number }
}

let active: Fixture
let unverified: Fixture

beforeAll(async () => {
  studentRole = await roleIdByName("Student", ADMIN)
  active = await createStudent("active")
  unverified = await createStudent("unverified")
})

afterAll(async () => {
  if (createdUsers.length > 0) {
    const response = await probeSend("DELETE", "/users", createdUsers, ADMIN)
    if (response.status !== 204) {
      throw new Error(`Probe cleanup failed: DELETE /users returned ${response.status}`)
    }
  }
})

describe("login / refresh / logout round-trip", () => {
  it("logs an active Student in and hands out both tokens", async () => {
    const response = await login(active.email, active.password)
    expect(response.status).toBe(200)
    const data = tokens(response)
    expect(typeof data.access_token).toBe("string")
    expect(typeof data.refresh_token).toBe("string")
    // Milliseconds of access-token lifetime — what the session turns into
    // `accessTokenExpiresAt`. 15 minutes on this instance.
    expect(data.expires).toBe(15 * 60 * 1000)
  })

  it("hands out a token that cannot read its own e-mail back", async () => {
    const data = tokens(await login(active.email, active.password))
    const me = await probe("/users/me?fields=id,email", data.access_token)
    // Directus answers 200 with the id alone: the Student policy has no
    // `read` on `directus_users`, so `email` is silently dropped. This is the
    // measured reason the session caches the e-mail in the sealed cookie
    // instead of calling readMe per render (ADR 0002).
    expect(me.status).toBe(200)
    expect(item(me).id).toBe(active.id)
    expect(item(me).email).toBeUndefined()
  })

  it("refreshes into a fresh pair and invalidates the used refresh token", async () => {
    const first = tokens(await login(active.email, active.password))

    const refreshed = await probeSend("POST", "/auth/refresh", {
      refresh_token: first.refresh_token,
      mode: "json",
    })
    expect(refreshed.status).toBe(200)
    const second = tokens(refreshed)
    expect(typeof second.access_token).toBe("string")
    // The refresh token rotates; the access token may be byte-identical when
    // both are minted inside the same second (same JWT claims).
    expect(second.refresh_token).not.toBe(first.refresh_token)

    // Rotation: replaying the consumed refresh token must fail, which is why
    // the session has to persist the new one on every refresh.
    const replay = await probeSend("POST", "/auth/refresh", {
      refresh_token: first.refresh_token,
      mode: "json",
    })
    expect(replay.status).toBe(401)
  })

  it("logs out and kills the refresh token", async () => {
    const data = tokens(await login(active.email, active.password))

    const loggedOut = await probeSend("POST", "/auth/logout", {
      refresh_token: data.refresh_token,
      mode: "json",
    })
    expect(loggedOut.status).toBe(204)

    const afterLogout = await probeSend("POST", "/auth/refresh", {
      refresh_token: data.refresh_token,
      mode: "json",
    })
    expect(afterLogout.status).toBe(401)
  })
})

describe("e-mail matching", () => {
  it("matches the e-mail case-insensitively at login", async () => {
    // Directus stores the address verbatim (no normalisation on write), but
    // logs in on a case-insensitive match — which is what lets the session
    // cache a lowercased e-mail without ever locking anyone out.
    const upper = await login(active.email.toUpperCase(), active.password)
    expect(upper.status).toBe(200)
  })
})

describe("login failures stay indistinguishable", () => {
  it("rejects a wrong password with INVALID_CREDENTIALS", async () => {
    const response = await login(active.email, generatePassword())
    expect(response.status).toBe(401)
    expect(errorCode(response)).toBe("INVALID_CREDENTIALS")
  })

  it("answers an unknown e-mail exactly like a wrong password", async () => {
    const unknown = await login(
      `probe-auth-nobody-${Date.now()}@jedlik-nejedlik.cz`,
      generatePassword(),
    )
    const wrong = await login(active.email, generatePassword())
    expect(unknown.status).toBe(wrong.status)
    expect(errorCode(unknown)).toBe(errorCode(wrong))
    expect(unknown.body.errors?.[0]?.message).toBe(wrong.body.errors?.[0]?.message)
  })

  it("does not distinguish an Unverified account from wrong credentials", async () => {
    // The open question from the spec, settled here: if this ever starts
    // failing, Directus has begun distinguishing the case and the login route
    // can surface a "confirm your e-mail first" message instead.
    const unverifiedLogin = await login(unverified.email, unverified.password)
    const wrong = await login(active.email, generatePassword())
    expect(unverifiedLogin.status).toBe(wrong.status)
    expect(errorCode(unverifiedLogin)).toBe(errorCode(wrong))
    expect(unverifiedLogin.body.errors?.[0]?.message).toBe(wrong.body.errors?.[0]?.message)
  })
})
