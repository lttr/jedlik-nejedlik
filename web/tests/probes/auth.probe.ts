import { afterAll, beforeAll, describe, expect, it } from "vitest"

import type { ProbeResponse } from "./support"
import {
  errorCode,
  generatePassword,
  item,
  items,
  probe,
  probeSend,
  roleIdByName,
  roleToken,
} from "./support"

// The app's own constant, so the probe proves it still matches the instance.
import { PASSWORD_MIN_LENGTH } from "../../layers/auth/shared/utils/password"

// The Directus auth contract the Nitro session routes are built on (area 02).
// Throwaway users are created and deleted with the admin token.
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

function throwawayEmail(label: string): string {
  return `probe-auth-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@jedlik-nejedlik.cz`
}

async function createStudent(status: "active" | "unverified"): Promise<Fixture> {
  const password = generatePassword()
  const email = throwawayEmail(status)
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

// The URLs the app asks Directus to put in its e-mails (see authPageUrl).
const VERIFICATION_URL = "https://www.jedlik-nejedlik.cz/overeni-emailu"
const RESET_URL = "https://www.jedlik-nejedlik.cz/obnova-hesla"

// Directus rate-limits the e-mail-sending endpoints per IP itself: a burst of
// seven answers 429 and the budget takes about 30 s to come back (measured).
// That is not the behaviour under test, so back off and retry; those suites
// get EMAIL_ENDPOINT_TIMEOUT_MS to absorb the wait.
const BACKOFF_MS = 5000
const BACKOFF_ATTEMPTS = 8
const EMAIL_ENDPOINT_TIMEOUT_MS = 120_000

async function postWithBackoff(path: string, payload: unknown): Promise<ProbeResponse> {
  let response = await probeSend("POST", path, payload)
  for (let attempt = 1; attempt < BACKOFF_ATTEMPTS && response.status === 429; attempt++) {
    await new Promise((resolve) => {
      setTimeout(resolve, BACKOFF_MS)
    })
    response = await probeSend("POST", path, payload)
  }
  return response
}

// `verification_url` is omitted except where the test is about it, so the
// rest of the contract does not depend on USER_REGISTER_URL_ALLOW_LIST.
async function register(
  email: string,
  password: string,
  verificationUrl?: string,
): Promise<ProbeResponse> {
  return postWithBackoff("/users/register", {
    email,
    password,
    ...(verificationUrl === undefined ? {} : { verification_url: verificationUrl }),
  })
}

// Same for `reset_url` and PASSWORD_RESET_URL_ALLOW_LIST.
async function requestReset(email: string, resetUrl?: string): Promise<ProbeResponse> {
  return postWithBackoff("/auth/password/request", {
    email,
    ...(resetUrl === undefined ? {} : { reset_url: resetUrl }),
  })
}

// Registration answers 204 with no id; find the user so cleanup can delete it.
async function findUser(email: string): Promise<Record<string, unknown> | undefined> {
  const response = await probe(
    `/users?fields=id,email,status,role&filter[email][_eq]=${encodeURIComponent(email)}`,
    ADMIN,
  )
  const user = items(response).at(0)
  if (user !== undefined) {
    createdUsers.push(user.id as string)
  }
  return user
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
    // Milliseconds of access-token lifetime; the session relies on 15 minutes.
    expect(data.expires).toBe(15 * 60 * 1000)
  })

  it("hands out a token that cannot read its own e-mail back", async () => {
    const data = tokens(await login(active.email, active.password))
    const me = await probe("/users/me?fields=id,email", data.access_token)
    // The Student policy has no `read` on `directus_users`, so `email` is
    // silently dropped: why the session caches the e-mail in the cookie.
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
    // The access token may be byte-identical when minted in the same second.
    expect(second.refresh_token).not.toBe(first.refresh_token)

    // Replaying the consumed token must fail: the session has to persist the
    // new one on every refresh.
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
    // Stored verbatim but matched case-insensitively, which is what lets the
    // session cache a lowercased e-mail without locking anyone out.
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
    const unknown = await login(throwawayEmail("nobody"), generatePassword())
    const wrong = await login(active.email, generatePassword())
    expect(unknown.status).toBe(wrong.status)
    expect(errorCode(unknown)).toBe(errorCode(wrong))
    expect(unknown.body.errors?.[0]?.message).toBe(wrong.body.errors?.[0]?.message)
  })

  it("does not distinguish an Unverified account from wrong credentials", async () => {
    // If this ever fails, Directus has begun distinguishing the case and the
    // login route can say "confirm your e-mail first".
    const unverifiedLogin = await login(unverified.email, unverified.password)
    const wrong = await login(active.email, generatePassword())
    expect(unverifiedLogin.status).toBe(wrong.status)
    expect(errorCode(unverifiedLogin)).toBe(errorCode(wrong))
    expect(unverifiedLogin.body.errors?.[0]?.message).toBe(wrong.body.errors?.[0]?.message)
  })
})

describe("public registration", { timeout: EMAIL_ENDPOINT_TIMEOUT_MS }, () => {
  // Registrations are rate-limited (see postWithBackoff), so spend sparingly.
  it("creates a Student-role, Unverified user who cannot log in yet", async () => {
    const email = throwawayEmail("register")
    const password = generatePassword()
    expect((await register(email, password)).status).toBe(204)

    const user = await findUser(email)
    // The role comes from `public_registration_role`; the payload names none.
    expect(user).toMatchObject({ email, status: "unverified", role: studentRole })

    // Rejected exactly like a wrong password, which is why the registration
    // confirmation has to spell out that the e-mail must be opened.
    const attempt = await login(email, password)
    expect(attempt.status).toBe(401)
    expect(errorCode(attempt)).toBe("INVALID_CREDENTIALS")
  })

  it("answers an already-registered address exactly like a fresh one", async () => {
    // Accounts stay unenumerable: a duplicate cannot be reported.
    const email = throwawayEmail("dup")
    const password = generatePassword()
    expect((await register(email, password)).status).toBe(204)
    await findUser(email)
    expect((await register(email, password)).status).toBe(204)
  })

  it("stores the address verbatim, so the app has to normalise it first", async () => {
    // Why StudentEmail lowercases: the mixed-case form would be a second row.
    const email = throwawayEmail("case")
    expect((await register(email.toUpperCase(), generatePassword())).status).toBe(204)
    const stored = await findUser(email.toUpperCase())
    expect(stored?.email).toBe(email.toUpperCase())
    expect(await findUser(email)).toBeUndefined()
  })

  it("enforces exactly the minimum length the app checks for", async () => {
    // One short must fail and the exact minimum pass, or PASSWORD_MIN_LENGTH
    // has drifted from the instance's `auth_password_policy`.
    const short = await register(throwawayEmail("short"), "x".repeat(PASSWORD_MIN_LENGTH - 1))
    expect(short.status).toBe(400)
    expect(errorCode(short)).toBe("FAILED_VALIDATION")

    const email = throwawayEmail("exact")
    expect((await register(email, "x".repeat(PASSWORD_MIN_LENGTH))).status).toBe(204)
    expect(await findUser(email)).toBeDefined()
  })

  // Ops gate: while this is red, every registration through the app answers
  // 502. Fix by setting USER_REGISTER_URL_ALLOW_LIST on the instance to
  // exactly VERIFICATION_URL.
  it("accepts the verification URL the app sends (USER_REGISTER_URL_ALLOW_LIST)", async () => {
    const email = throwawayEmail("allowlist")
    const response = await register(email, generatePassword(), VERIFICATION_URL)
    expect(response.status).toBe(204)
    await findUser(email)
  })
})

describe("password change from the account page", () => {
  // The route only ever writes as the logged-in Student.
  async function signedIn(): Promise<{ student: Fixture; accessToken: string }> {
    const student = await createStudent("active")
    const { access_token: accessToken } = tokens(await login(student.email, student.password))
    return { student, accessToken }
  }

  it("lets a Student change their own password and locks the old one out", async () => {
    const { student, accessToken } = await signedIn()
    const newPassword = generatePassword()

    const changed = await probeSend(
      "PATCH",
      `/users/${student.id}`,
      { password: newPassword },
      accessToken,
    )
    expect(changed.status).toBe(204)

    expect((await login(student.email, student.password)).status).toBe(401)
    expect((await login(student.email, newPassword)).status).toBe(200)
  })

  it("answers PATCH /users/me with 403 even though it wrote the password", async () => {
    // Why the route uses `PATCH /users/:pk`: Directus reads the row back
    // before replying, `/users/me` does not tolerate the refused read, and the
    // Student policy has no `read` on `directus_users`.
    const { student, accessToken } = await signedIn()
    const newPassword = generatePassword()

    const changed = await probeSend("PATCH", "/users/me", { password: newPassword }, accessToken)
    expect(changed.status).toBe(403)
    // Written anyway: the 403 is a lie.
    expect((await login(student.email, newPassword)).status).toBe(200)
  })

  it("signs the Student out of every session, the changing one included", async () => {
    // Directus spares only the session in the access token's `session` claim,
    // which json-mode logins lack, so the route has to log the Student back
    // in. If this goes red, that re-login may have become unnecessary.
    const student = await createStudent("active")
    const here = tokens(await login(student.email, student.password))
    const elsewhere = tokens(await login(student.email, student.password))

    const changed = await probeSend(
      "PATCH",
      `/users/${student.id}`,
      { password: generatePassword() },
      here.access_token,
    )
    expect(changed.status).toBe(204)

    for (const session of [elsewhere, here]) {
      const refreshed = await probeSend("POST", "/auth/refresh", {
        refresh_token: session.refresh_token,
        mode: "json",
      })
      expect(refreshed.status).toBe(401)
    }
  })

  it("cannot change another Student's password", async () => {
    const { accessToken } = await signedIn()
    const victim = await createStudent("active")
    const stolen = generatePassword()

    const forbidden = await probeSend(
      "PATCH",
      `/users/${victim.id}`,
      { password: stolen },
      accessToken,
    )
    expect(forbidden.status).toBe(403)
    // Not merely refused: the victim's password is untouched.
    expect((await login(victim.email, stolen)).status).toBe(401)
    expect((await login(victim.email, victim.password)).status).toBe(200)
  })

  it.each([
    ["status", { status: "active" }],
    ["role", { role: null }],
    ["email", { email: "someone-else@jedlik-nejedlik.cz" }],
  ])("cannot change its own %s along with the password", async (_field, payload) => {
    // Row scope alone would let a Student self-promote; the `password`-only
    // field list is as load-bearing as the filter.
    const { student, accessToken } = await signedIn()

    const response = await probeSend(
      "PATCH",
      `/users/${student.id}`,
      { password: generatePassword(), ...payload },
      accessToken,
    )
    expect(response.status).toBe(403)
  })
})

describe("e-mail verification", () => {
  it.each([
    ["a forged token", "?token=not-a-real-token"],
    ["no token at all", ""],
  ])("rejects %s with INVALID_TOKEN", async (_label, query) => {
    const response = await probe(`/users/register/verify-email${query}`)
    expect(response.status).toBe(403)
    expect(errorCode(response)).toBe("INVALID_TOKEN")
  })
})

describe("password reset request", { timeout: EMAIL_ENDPOINT_TIMEOUT_MS }, () => {
  it("answers an unknown address exactly like a registered one", async () => {
    // The page's uniform confirmation is only honest because Directus itself
    // answers 204 either way.
    const known = await requestReset(active.email)
    const unknown = await requestReset(throwawayEmail("nobody"))
    expect(known.status).toBe(204)
    expect(unknown.status).toBe(known.status)
    expect(unknown.body).toEqual(known.body)
  })

  it("answers an Unverified account like any other", async () => {
    expect((await requestReset(unverified.email)).status).toBe(204)
  })

  // Ops gate: an unrecognised `reset_url` is rejected with 400, but only for
  // a *registered* address, so a wrong allow list makes accounts enumerable.
  // Fix by setting PASSWORD_RESET_URL_ALLOW_LIST on the instance to exactly
  // RESET_URL.
  it("accepts the reset URL the app sends (PASSWORD_RESET_URL_ALLOW_LIST)", async () => {
    const response = await requestReset(active.email, RESET_URL)
    expect(response.status).toBe(204)
  })
})

describe("password reset completion", () => {
  it.each([
    ["a forged token", "not-a-real-token"],
    ["an empty token", ""],
  ])("rejects %s", async (_label, token) => {
    // The app treats any rejection other than FAILED_VALIDATION as a dead
    // link, so only that much is pinned.
    const response = await probeSend("POST", "/auth/password/reset", {
      token,
      password: generatePassword(),
    })
    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(errorCode(response)).not.toBe("FAILED_VALIDATION")
  })
})
