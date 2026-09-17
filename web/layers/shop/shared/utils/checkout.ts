import { z } from "zod"

import type { Course, Order } from "../../../directus/shared/utils/schemas"

// The Checkout's vocabulary, pure so the page, the Nitro routes and the tests
// all agree on it: what Billing Details are, which Consent an Order carries,
// and which earlier Order a returning Student is sent back to.

// Billing Details carry the Directus column names on purpose. They are the
// same six columns on `directus_users` (the Account) and on `order` (the
// snapshot), so one name per thing means no mapping table to keep honest.
export const BILLING_FIELDS = [
  "billing_name",
  "billing_company",
  "billing_ic",
  "billing_street",
  "billing_city",
  "billing_zip",
] as const

export type BillingField = (typeof BILLING_FIELDS)[number]

// All six are optional (a name is never a wall between a Student and a
// Course), and the form binds to strings, so „not filled in" is `""` here and
// `null` on the wire.
export type BillingDetails = Record<BillingField, string>

// The block the form keeps collapsed unless something in it is filled in.
export const BILLING_COMPANY_FIELDS: readonly BillingField[] = [
  "billing_company",
  "billing_ic",
  "billing_street",
  "billing_city",
  "billing_zip",
]

export function emptyBillingDetails(): BillingDetails {
  return {
    billing_name: "",
    billing_company: "",
    billing_ic: "",
    billing_street: "",
    billing_city: "",
    billing_zip: "",
  }
}

// A Directus row (or a request body) in, a form-ready object out: anything
// missing or null becomes an empty string, anything else is trimmed.
export function toBillingDetails(row: Partial<Record<BillingField, unknown>>): BillingDetails {
  const details = emptyBillingDetails()
  for (const field of BILLING_FIELDS) {
    const value = row[field]
    details[field] = typeof value === "string" ? value.trim() : ""
  }
  return details
}

// The other direction: an empty field is stored as `null`, not as `""`, so a
// cleared field reads back the same way one that was never filled in does.
export type BillingPayload = Record<BillingField, string | null>

export function toBillingPayload(details: BillingDetails): BillingPayload {
  const payload: BillingPayload = { ...details }
  for (const field of BILLING_FIELDS) {
    payload[field] = details[field] === "" ? null : details[field]
  }
  return payload
}

export function hasBillingCompanyDetails(details: BillingDetails): boolean {
  return BILLING_COMPANY_FIELDS.some((field) => details[field] !== "")
}

// A Course that can actually be bought. `price_czk` is optional on `Course`
// because the Catalog shows Courses that have no price yet; nothing past the
// Checkout route's price check ever sees one.
export type SellableCourse = Course & { price_czk: number }

// What the Checkout route answers and the Checkout page renders: the Course
// being bought, who is buying it, and the Billing Details their Account
// already holds. Shared, because the page is the only consumer and it is not
// Nitro code.
export interface CheckoutView {
  course: SellableCourse
  email: string
  billing: BillingDetails
}

// The terms' effective date, which is what the Order records as the version
// the Student agreed to (spec, „Order flow"). A constant until area 10 owns
// document versions; it must match the date at the foot of
// `app/pages/obchodni-podminky.vue`.
export const TERMS_VERSION = "2026-01-28"

// The Consents an Order is created with. A list, because area 10 may add the
// § 1837 waiver next to the terms; deliberately not the GDPR policy, which the
// Checkout only informs about and never asks consent for.
export function checkoutConsents(): { document: "terms"; document_version: string }[] {
  return [{ document: "terms", document_version: TERMS_VERSION }]
}

// An Order of this Student for this Course that still has a Payment to go
// back to. Only the newest candidate is offered, because an older one can only
// exist if it was already passed over — every Checkout either reuses the
// newest live Payment or starts a fresh Order (spec, „Order flow").
export function reusableOrder(orders: Order[]): Order | undefined {
  return orders
    .filter((order) => order.status === "created" && order.gopay_payment_id !== undefined)
    .toSorted((a, b) => b.id - a.id)[0]
}

// A refusal a page knows how to render itself, dug out of whatever `$fetch`
// threw. A route's `createError({ statusMessage, message })` arrives in the
// error's `data`, while the error's own `message` is ofetch's technical one
// („[GET] …: 409"), so only the body is worth showing a Student. The status
// code has to match too: a page asks for the refusal it can render, and
// anything else stays an error.
export interface Refusal {
  // `statusMessage` from the route: which refusal this is, for a page that
  // offers a different way onward for each.
  code: string
  message: string
}

const NitroRefusalSchema = z.object({
  statusCode: z.number(),
  data: z.object({ statusMessage: z.string().min(1), message: z.string().min(1) }),
})

export function readRefusal(error: unknown, statusCode: number): Refusal | undefined {
  const parsed = NitroRefusalSchema.safeParse(error)
  if (!parsed.success || parsed.data.statusCode !== statusCode) {
    return undefined
  }
  return { code: parsed.data.data.statusMessage, message: parsed.data.data.message }
}
