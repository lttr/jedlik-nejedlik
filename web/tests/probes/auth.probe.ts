import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { STUDENT_ROLE_ID, errorCode, item, items, probe, probeSend, roleToken } from "./support"

// The auth contract the customers layer depends on, asserted directly against
// the production Directus instance: what the registration service token may
// do, and how a Student's session behaves end to end. Everything runs on a
// throwaway Student created and deleted by this file.
//
// Required environment (static tokens, never committed):
//   DIRECTUS_PROBE_SERVICE_TOKEN  registration service user (create Students only)
//   DIRECTUS_PROBE_ADMIN_TOKEN    admin token (fixture lookup + cleanup)

const SERVICE = roleToken("DIRECTUS_PROBE_SERVICE_TOKEN")
const ADMIN = roleToken("DIRECTUS_PROBE_ADMIN_TOKEN")

const PASSWORD = "ProbeHeslo123"
const stamp = Date.now()
const email = `probe-auth-${stamp}@jedlik-nejedlik.cz`

// Users created during the run; deleted with the admin token in afterAll.
const createdUsers: string[] = []

async function findUserId(address: string): Promise<string | undefined> {
  const response = await probe(
    `/users?filter[email][_eq]=${encodeURIComponent(address)}&fields=id`,
    ADMIN,
  )
  const rows = items(response)
  return rows[0]?.id as string | undefined
}

async function registerStudent(address: string, password: string) {
  const response = await probeSend(
    "POST",
    "/users",
    { email: address, password, role: STUDENT_ROLE_ID, provider: "default" },
    SERVICE,
  )
  if (response.status === 200 || response.status === 204) {
    const id = await findUserId(address)
    if (id !== undefined) {
      createdUsers.push(id)
    }
  }
  return response
}

async function loginAs(address: string, password: string) {
  return probeSend("POST", "/auth/login", { email: address, password, mode: "json" })
}

beforeAll(async () => {
  const response = await registerStudent(email, PASSWORD)
  if (response.status !== 200 && response.status !== 204) {
    throw new Error(`Probe setup failed: POST /users returned ${response.status}`)
  }
})

afterAll(async () => {
  if (createdUsers.length > 0) {
    const response = await probeSend("DELETE", "/users", createdUsers, ADMIN)
    if (response.status !== 204) {
      throw new Error(`Probe cleanup failed: DELETE /users returned ${response.status}`)
    }
  }
})

describe("registration service token", () => {
  it("creates a Student-role user", async () => {
    const id = await findUserId(email)
    expect(id).toBeDefined()

    const created = item(await probe(`/users/${id}?fields=role,status`, ADMIN))
    expect(created.role).toBe(STUDENT_ROLE_ID)
    expect(created.status).toBe("active")
  })

  it("refuses to create a user with any other role", async () => {
    const response = await probeSend(
      "POST",
      "/users",
      {
        email: `probe-auth-elevated-${stamp}@jedlik-nejedlik.cz`,
        password: PASSWORD,
        role: null,
        provider: "default",
      },
      SERVICE,
    )
    expect(response.status).toBeGreaterThanOrEqual(400)

    // Belt and braces: nothing was created under the hood either.
    expect(await findUserId(`probe-auth-elevated-${stamp}@jedlik-nejedlik.cz`)).toBeUndefined()
  })

  it("cannot read existing users", async () => {
    const response = await probe("/users?limit=1", SERVICE)
    expect(response.status).toBeGreaterThanOrEqual(400)
  })

  it("cannot update an existing user", async () => {
    const id = await findUserId(email)
    const response = await probeSend("PATCH", `/users/${id}`, { first_name: "Probe" }, SERVICE)
    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})

describe("session round-trip", () => {
  it("logs in, refreshes and logs out", async () => {
    const login = await loginAs(email, PASSWORD)
    expect(login.status).toBe(200)
    const session = item(login)
    expect(typeof session.access_token).toBe("string")
    expect(typeof session.refresh_token).toBe("string")
    expect(typeof session.expires).toBe("number")

    const refreshed = await probeSend("POST", "/auth/refresh", {
      refresh_token: session.refresh_token,
      mode: "json",
    })
    expect(refreshed.status).toBe(200)
    const next = item(refreshed)
    expect(typeof next.access_token).toBe("string")
    expect(next.refresh_token).not.toBe(session.refresh_token)

    const loggedOut = await probeSend("POST", "/auth/logout", {
      refresh_token: next.refresh_token,
      mode: "json",
    })
    expect(loggedOut.status).toBe(204)

    // The refresh token is spent — the session cannot be resurrected.
    const afterLogout = await probeSend("POST", "/auth/refresh", {
      refresh_token: next.refresh_token,
      mode: "json",
    })
    expect(afterLogout.status).toBeGreaterThanOrEqual(400)
  })

  it("reads its own e-mail through the session token", async () => {
    const session = item(await loginAs(email, PASSWORD))
    const me = item(await probe("/users/me?fields=id,email", session.access_token as string))
    expect(me.email).toBe(email)
  })
})

describe("wrong credentials", () => {
  it("rejects a wrong password without saying why", async () => {
    const response = await loginAs(email, "ZcelaSpatneHeslo")
    expect(response.status).toBe(401)
    expect(errorCode(response)).toBe("INVALID_CREDENTIALS")
  })

  it("answers identically for an unknown e-mail", async () => {
    const response = await loginAs(`probe-auth-nobody-${stamp}@jedlik-nejedlik.cz`, PASSWORD)
    expect(response.status).toBe(401)
    expect(errorCode(response)).toBe("INVALID_CREDENTIALS")
  })
})

describe("password policy", () => {
  it("refuses a password shorter than the instance policy", async () => {
    const response = await registerStudent(`probe-auth-short-${stamp}@jedlik-nejedlik.cz`, "Krat1")
    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})
