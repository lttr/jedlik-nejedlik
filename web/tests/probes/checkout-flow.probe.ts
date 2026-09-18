import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { BILLING_FIELDS } from "../../layers/shop/shared/utils/checkout"
import { CookieJar, startAppServer } from "./app-server"
import type { AppServer } from "./app-server"
import { PUBLISHED_SLUG, cleanUpItems, item, items, probe, probeSend, roleToken } from "./support"

// The payment flow end to end: a real Nuxt server against the real Directus
// instance, paying through the mock gateway (spec, „Flow tests through the
// mock gateway"). What is asserted is only what an outsider can see — an HTTP
// status, the answer's JSON, a row in Directus.
//
// Required environment (never committed), all of it already in web/.env:
//   NUXT_SHOP_DIRECTUS_TOKEN                the Service Account's token
//   DIRECTUS_PROBE_STUDENT_UNENTITLED_EMAIL the Student who buys
//   DIRECTUS_PROBE_PASSWORD                 their password
//   DIRECTUS_PROBE_ADMIN_TOKEN              reading outcomes and cleaning up

const ADMIN = roleToken("DIRECTUS_PROBE_ADMIN_TOKEN")
const STUDENT_EMAIL = process.env.DIRECTUS_PROBE_STUDENT_UNENTITLED_EMAIL ?? ""
const STUDENT_PASSWORD = process.env.DIRECTUS_PROBE_PASSWORD ?? ""
const SHOP_TOKEN = process.env.NUXT_SHOP_DIRECTUS_TOKEN ?? ""

// No Order will ever carry this: the forged-notification case.
const UNKNOWN_PAYMENT_ID = "900000000000000"

const BILLING = {
  billing_name: "[TEST] Probe Student",
  billing_company: "",
  billing_ic: "",
  billing_street: "",
  billing_city: "",
  billing_zip: "",
}

let app: AppServer
const jar = new CookieJar()

// The fixture Student's row, so the Billing Details the Checkout remembers on
// it can be put back the way the run found them.
let studentId = ""
let studentBilling: Record<string, unknown> = {}

// Everything the run creates, so it can be taken off the instance again.
const createdOrders: number[] = []

async function site(
  path: string,
  init: { method?: string; body?: string } = {},
): Promise<Response> {
  const response = await fetch(`${app.url}${path}`, {
    ...init,
    headers: { "content-type": "application/json", cookie: jar.header() },
    // Followed by hand where it matters: the mock gateway's 303 is the
    // assertion, not a step on the way somewhere.
    redirect: "manual",
  })
  jar.remember(response)
  return response
}

async function logIn(): Promise<void> {
  const response = await site("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: STUDENT_EMAIL, password: STUDENT_PASSWORD }),
  })
  if (!response.ok) {
    throw new Error(`The probe Student could not log in: ${response.status}`)
  }
}

// „Objednávka zavazující k platbě": the gateway URL, and the mock Payment
// behind it with the Order it was created for.
async function placeOrder(): Promise<{ gwUrl: string; paymentId: string; orderId: number }> {
  const response = await site(`/api/checkout/${PUBLISHED_SLUG}`, {
    method: "POST",
    body: JSON.stringify({ consent: true, billing: BILLING }),
  })
  expect(response.status).toBe(200)
  const { gwUrl } = (await response.json()) as { gwUrl: string }

  const paymentId = new URL(gwUrl).pathname.split("/").pop() ?? ""
  const payment = await site(`/api/gopay/mock/payments/${paymentId}`)
  const { orderId } = (await payment.json()) as { orderId: number }
  if (!createdOrders.includes(orderId)) {
    createdOrders.push(orderId)
  }
  return { gwUrl, paymentId, orderId }
}

// The payer's press at the gateway. The mock notifies the site and awaits the
// answer before redirecting, so the Order is settled by the time this returns.
async function decide(paymentId: string, action: "pay" | "cancel" | "choose"): Promise<void> {
  const response = await site(`/api/gopay/mock/payments/${paymentId}/decide`, {
    method: "POST",
    body: JSON.stringify({ action }),
  })
  expect(response.status).toBe(303)
}

async function notify(paymentId: string): Promise<Response> {
  return site(`/api/gopay/notify?id=${paymentId}`)
}

async function orderStatus(orderId: number): Promise<unknown> {
  return item(await probe(`/items/order/${orderId}?fields=status`, ADMIN)).status
}

async function entitlementsOf(orderId: number): Promise<Record<string, unknown>[]> {
  return items(
    await probe(`/items/entitlement?fields=id,order&filter[order][_eq]=${orderId}`, ADMIN),
  )
}

async function returnView(orderId: number): Promise<{ state: string; courseSlug: string }> {
  const response = await site(`/api/orders/${orderId}/settlement`)
  expect(response.status).toBe(200)
  return (await response.json()) as { state: string; courseSlug: string }
}

// Runs only where the fixture Student and the Service Account's token are in
// the environment; the flow cannot be faked without either.
const ready = STUDENT_EMAIL !== "" && STUDENT_PASSWORD !== "" && SHOP_TOKEN !== ""

describe.skipIf(!ready)("checkout flow through the mock gateway", () => {
  // A cold `nuxi dev` plus the first SSR compile.
  beforeAll(async () => {
    const fields = `id,${BILLING_FIELDS.join(",")}`
    const rows = items(
      await probe(`/users?fields=${fields}&filter[email][_eq]=${STUDENT_EMAIL}`, ADMIN),
    )
    if (rows.length === 0) {
      throw new Error(`No Directus user ${STUDENT_EMAIL}`)
    }
    const student = rows[0]
    studentId = student.id as string
    studentBilling = Object.fromEntries(BILLING_FIELDS.map((c) => [c, student[c] ?? null]))

    app = await startAppServer()
    await logIn()
  }, 240_000)

  afterAll(async () => {
    // Orders first would orphan nothing, but the Entitlement points at an
    // Order, so it goes first either way.
    for (const orderId of createdOrders) {
      await cleanUpItems(
        "/items/entitlement",
        (await entitlementsOf(orderId)).map((row) => row.id as number),
        ADMIN,
      )
      await cleanUpItems(
        "/items/order_consent",
        items(
          await probe(`/items/order_consent?fields=id&filter[order][_eq]=${orderId}`, ADMIN),
        ).map((row) => row.id as number),
        ADMIN,
      )
    }
    await cleanUpItems("/items/order", createdOrders, ADMIN)
    // The Checkout remembers Billing Details on the Account; the fixture is
    // permanent, so it is put back the way it was found.
    await probeSend("PATCH", `/users/${studentId}`, studentBilling, ADMIN)
    await app.stop()
  }, 120_000)

  let firstPaymentId = ""
  let firstOrderId = 0
  let paidPaymentId = ""
  let paidOrderId = 0

  it("sends a returning Student back to the same Payment instead of a second Order", async () => {
    const first = await placeOrder()
    firstPaymentId = first.paymentId
    firstOrderId = first.orderId

    const again = await placeOrder()
    expect(again.gwUrl).toBe(first.gwUrl)
    expect(again.orderId).toBe(first.orderId)
  })

  it("writes nothing while GoPay still reports PAYMENT_METHOD_CHOSEN", async () => {
    await decide(firstPaymentId, "choose")

    expect(await orderStatus(firstOrderId)).toBe("created")
    expect(await entitlementsOf(firstOrderId)).toHaveLength(0)
    expect((await returnView(firstOrderId)).state).toBe("pending")
  })

  it("cancels the Order when the payer cancels, and grants nothing", async () => {
    await decide(firstPaymentId, "cancel")

    expect(await orderStatus(firstOrderId)).toBe("cancelled")
    expect(await entitlementsOf(firstOrderId)).toHaveLength(0)

    const view = await returnView(firstOrderId)
    expect(view.state).toBe("failed")
    // „Zkusit znovu" leads back to the Checkout for this Course.
    expect(view.courseSlug).toBe(PUBLISHED_SLUG)
  })

  it("answers 200 and writes nothing for a Payment id no Order carries", async () => {
    const response = await notify(UNKNOWN_PAYMENT_ID)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: "unknown" })
  })

  it("starts a fresh Payment after a failed one", async () => {
    const retry = await placeOrder()
    paidPaymentId = retry.paymentId
    paidOrderId = retry.orderId

    expect(retry.paymentId).not.toBe(firstPaymentId)
    expect(retry.orderId).not.toBe(firstOrderId)
  })

  it("marks the Order paid and grants exactly one Entitlement", async () => {
    await decide(paidPaymentId, "pay")

    expect(await orderStatus(paidOrderId)).toBe("paid")
    const granted = await entitlementsOf(paidOrderId)
    expect(granted).toHaveLength(1)
    expect((await returnView(paidOrderId)).state).toBe("paid")
  })

  it("changes nothing when the notification is repeated", async () => {
    const second = await notify(paidPaymentId)
    const third = await notify(paidPaymentId)

    expect(second.status).toBe(200)
    expect(third.status).toBe(200)
    expect(await orderStatus(paidOrderId)).toBe("paid")
    expect(await entitlementsOf(paidOrderId)).toHaveLength(1)
  })
})
