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

// The app's own constant, so this probe is the proof that it still matches the
// instance's `auth_password_policy` rather than a second, hopeful copy of it.
import { PASSWORD_MIN_LENGTH } from "../../layers/auth/shared/utils/password"

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

// The absolute URL the app asks Directus to put in the verification e-mail
// (layers/auth/server/utils/registration.ts, built from the site URL).
const VERIFICATION_URL = "https://www.jedlik-nejedlik.cz/overeni-emailu"

// The absolute URL the app asks Directus to put in the password-reset e-mail
// (layers/auth/server/utils/password-reset.ts, built the same way).
const RESET_URL = "https://www.jedlik-nejedlik.cz/obnova-hesla"

// Directus rate-limits the unauthenticated e-mail-sending endpoints per IP
// itself, on top of the app's own limiter: a burst of seven answers 429 and
// the budget takes about 30 seconds to come back (measured 2026-08-28). A
// suite that registers or asks for a reset a handful of times in a row is
// exactly such a burst, so back off and retry — that budget has nothing to do
// with the behaviour under test, and asserting on it would only make the suite
// flaky. Those tests get EMAIL_ENDPOINT_TIMEOUT_MS to absorb the wait.
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

// Registration is anonymous: no token, exactly as the Nitro route calls it.
// The `verification_url` is omitted except where the test is about it, so that
// the rest of the contract can be asserted independently of the instance's
// USER_REGISTER_URL_ALLOW_LIST.
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

// Same treatment for the reset request, and the same reason to keep the
// `reset_url` optional: PASSWORD_RESET_URL_ALLOW_LIST gets its own test.
async function requestReset(email: string, resetUrl?: string): Promise<ProbeResponse> {
  return postWithBackoff("/auth/password/request", {
    email,
    ...(resetUrl === undefined ? {} : { reset_url: resetUrl }),
  })
}

// Registered users have no id in the 204 response; find them as admin so the
// cleanup can delete them again.
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
    const unknown = await login(throwawayEmail("nobody"), generatePassword())
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

describe("public registration", { timeout: EMAIL_ENDPOINT_TIMEOUT_MS }, () => {
  // Directus rate-limits `/users/register` per IP itself (429), on top of our
  // own limiter, so this suite spends registrations sparingly: each test makes
  // the fewest calls that still prove its point.
  it("creates a Student-role, Unverified user who cannot log in yet", async () => {
    const email = throwawayEmail("register")
    const password = generatePassword()
    expect((await register(email, password)).status).toBe(204)

    const user = await findUser(email)
    // The role comes from the instance's `public_registration_role`; nothing
    // in app source names it, and the payload above carries no role at all.
    expect(user).toMatchObject({ email, status: "unverified", role: studentRole })

    // Unverified until the e-mailed link is followed, and the rejection is
    // byte-identical to a wrong password — which is why the registration
    // confirmation has to spell out that the e-mail must be opened. There is
    // no hint to be had at the login form.
    const attempt = await login(email, password)
    expect(attempt.status).toBe(401)
    expect(errorCode(attempt)).toBe("INVALID_CREDENTIALS")
  })

  it("answers an already-registered address exactly like a fresh one", async () => {
    // Accounts stay unenumerable: registration cannot report a duplicate, and
    // the page's confirmation is written to cover both cases.
    const email = throwawayEmail("dup")
    const password = generatePassword()
    expect((await register(email, password)).status).toBe(204)
    await findUser(email)
    expect((await register(email, password)).status).toBe(204)
  })

  it("stores the address verbatim, so the app has to normalise it first", async () => {
    // The reason StudentEmail trims and lowercases: registering the mixed-case
    // form would otherwise create a second row that nothing ever reports.
    const email = throwawayEmail("case")
    expect((await register(email.toUpperCase(), generatePassword())).status).toBe(204)
    const stored = await findUser(email.toUpperCase())
    expect(stored?.email).toBe(email.toUpperCase())
    expect(await findUser(email)).toBeUndefined()
  })

  it("enforces exactly the minimum length the app checks for", async () => {
    // `auth_password_policy` on the instance is `/^.{8,}$/` — a length and
    // nothing else. One character short must fail and the exact minimum must
    // pass, or PASSWORD_MIN_LENGTH has drifted from the instance.
    const short = await register(throwawayEmail("short"), "x".repeat(PASSWORD_MIN_LENGTH - 1))
    expect(short.status).toBe(400)
    expect(errorCode(short)).toBe("FAILED_VALIDATION")

    const email = throwawayEmail("exact")
    expect((await register(email, "x".repeat(PASSWORD_MIN_LENGTH))).status).toBe(204)
    expect(await findUser(email)).toBeDefined()
  })

  // The ops gate for this flow, and the reason it is a test rather than a
  // ticked box: Directus only mails a `verification_url` it recognises. While
  // this is red, every registration through the app answers 502 and no
  // verification e-mail is ever sent. Fix by setting, on the Directus
  // instance, USER_REGISTER_URL_ALLOW_LIST to exactly VERIFICATION_URL.
  it("accepts the verification URL the app sends (USER_REGISTER_URL_ALLOW_LIST)", async () => {
    const email = throwawayEmail("allowlist")
    const response = await register(email, generatePassword(), VERIFICATION_URL)
    expect(response.status).toBe(204)
    await findUser(email)
  })
})

describe("password change from the account page", () => {
  // Everything ticket 05's route is built on. The write is the Student's own,
  // through their own session — the app has no other Directus credential.
  it("lets a Student change their own password and locks the old one out", async () => {
    const student = await createStudent("active")
    const session = tokens(await login(student.email, student.password))
    const newPassword = generatePassword()

    // The endpoint the app uses, and the reason it does: see the next test.
    const changed = await probeSend(
      "PATCH",
      `/users/${student.id}`,
      { password: newPassword },
      session.access_token,
    )
    expect(changed.status).toBe(204)

    expect((await login(student.email, student.password)).status).toBe(401)
    expect((await login(student.email, newPassword)).status).toBe(200)
  })

  it("answers PATCH /users/me with 403 even though it wrote the password", async () => {
    // The trap the change-password route steers around. Directus reads the
    // updated row back before replying; `PATCH /users/:pk` tolerates a refused
    // read, `PATCH /users/me` does not — and the Student policy has no `read`
    // on `directus_users` at all. So /users/me reports failure for a change
    // that happened, which no caller can tell from a real refusal.
    const student = await createStudent("active")
    const session = tokens(await login(student.email, student.password))
    const newPassword = generatePassword()

    const changed = await probeSend(
      "PATCH",
      "/users/me",
      { password: newPassword },
      session.access_token,
    )
    expect(changed.status).toBe(403)
    // Written anyway — this is the half that makes the 403 a lie.
    expect((await login(student.email, newPassword)).status).toBe(200)
  })

  it("signs the Student out of every session, the changing one included", async () => {
    // Directus 11 deletes the user's session rows on a password change and
    // spares only the session named in the access token's `session` claim —
    // a claim only cookie-mode logins carry. The app logs in with
    // `mode: "json"`, so nothing is spared and the change-password route has
    // to log the Student back in to keep the browser signed in. If this test
    // ever goes red, Directus has changed that behaviour and the route's
    // re-login may have become unnecessary.
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
    const student = await createStudent("active")
    const victim = await createStudent("active")
    const session = tokens(await login(student.email, student.password))
    const stolen = generatePassword()

    const forbidden = await probeSend(
      "PATCH",
      `/users/${victim.id}`,
      { password: stolen },
      session.access_token,
    )
    expect(forbidden.status).toBe(403)
    // Not merely refused — the victim's password is untouched.
    expect((await login(victim.email, stolen)).status).toBe(401)
    expect((await login(victim.email, victim.password)).status).toBe(200)
  })

  it.each([
    ["status", { status: "active" }],
    ["role", { role: null }],
    ["email", { email: "someone-else@jedlik-nejedlik.cz" }],
  ])("cannot change its own %s along with the password", async (_field, payload) => {
    // The Student policy's `update` is narrowed to the `password` field. Row
    // scope alone would let a Student edit their own role or status and
    // self-promote, so the field list is as load-bearing as the filter.
    const student = await createStudent("active")
    const session = tokens(await login(student.email, student.password))

    const response = await probeSend(
      "PATCH",
      `/users/${student.id}`,
      { password: generatePassword(), ...payload },
      session.access_token,
    )
    expect(response.status).toBe(403)
  })
})

describe("e-mail verification", () => {
  it.each([
    ["a forged token", "?token=not-a-real-token"],
    ["no token at all", ""],
  ])("rejects %s with INVALID_TOKEN", async (_label, query) => {
    // Expired, already used and forged all land here, so the page shows one
    // message and offers the routes onward (story 31).
    const response = await probe(`/users/register/verify-email${query}`)
    expect(response.status).toBe(403)
    expect(errorCode(response)).toBe("INVALID_TOKEN")
  })
})

describe("password reset request", { timeout: EMAIL_ENDPOINT_TIMEOUT_MS }, () => {
  it("answers an unknown address exactly like a registered one", async () => {
    // The uniform confirmation the page shows is only honest because Directus
    // swallows the "no such user" case itself: it answers 204 either way, so
    // nothing downstream can tell them apart (story 13).
    const known = await requestReset(active.email)
    const unknown = await requestReset(throwawayEmail("nobody"))
    expect(known.status).toBe(204)
    expect(unknown.status).toBe(known.status)
    expect(unknown.body).toEqual(known.body)
  })

  it("answers an Unverified account like any other", async () => {
    // A Student who never followed the verification link is not a special
    // case here either — no reset mail, no different answer.
    expect((await requestReset(unverified.email)).status).toBe(204)
  })

  // The ops gate for this flow, and the reason it is a test rather than a
  // ticked box: Directus only mails a `reset_url` it recognises, and it
  // rejects an unrecognised one with 400 — for a *registered* address only,
  // since an unknown one never gets that far. So a wrong allow list does not
  // merely break the flow, it makes accounts enumerable through the status
  // code. Fix by setting, on the Directus instance,
  // PASSWORD_RESET_URL_ALLOW_LIST to exactly RESET_URL.
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
    // Expired, already used and forged all land here, so the page shows one
    // message and offers a fresh link (story 15). The app treats any Directus
    // rejection other than FAILED_VALIDATION as a dead link, so the exact code
    // does not have to be pinned — only that it is a rejection, and that the
    // instance never accepts a token it did not mint.
    const response = await probeSend("POST", "/auth/password/reset", {
      token,
      password: generatePassword(),
    })
    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(errorCode(response)).not.toBe("FAILED_VALIDATION")
  })
})
