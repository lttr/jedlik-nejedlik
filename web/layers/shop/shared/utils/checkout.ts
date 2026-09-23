import { z } from "zod"

import type { Course, Order } from "#layers/directus/shared/utils/schemas"

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

// The block the form keeps collapsed unless something in it is filled in:
// everything but the name, derived so a seventh column joins it by itself.
const BILLING_COMPANY_FIELDS: readonly BillingField[] = BILLING_FIELDS.filter(
  (field) => field !== "billing_name",
)

// The cap the routes enforce, and the `maxlength` the form carries, so the
// browser stops a paste the route would only be able to refuse.
export const BILLING_FIELD_MAX_LENGTH = 200

const BillingFieldSchema = z.string().trim().max(BILLING_FIELD_MAX_LENGTH)

// Every field is required but may be empty: a missing one would keep the old
// value on one route and clear it on the other. Spelled out rather than
// derived, so the routes keep a field-by-field inferred type.
export const BillingRequestSchema = z.object({
  billing_name: BillingFieldSchema,
  billing_company: BillingFieldSchema,
  billing_ic: BillingFieldSchema,
  billing_street: BillingFieldSchema,
  billing_city: BillingFieldSchema,
  billing_zip: BillingFieldSchema,
})

// All six empty, built from the one list of columns and checked by the schema
// the routes use, so a column added above cannot be forgotten here.
export function emptyBillingDetails(): BillingDetails {
  return BillingRequestSchema.parse(Object.fromEntries(BILLING_FIELDS.map((f) => [f, ""])))
}

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
  // Spread first only to start from an object that already has all six keys;
  // the loop below replaces every one of them.
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
  // `null` for a visitor without a session: they see what they are buying and
  // step 1's „Mám účet" / „Jsem tu poprvé" tabs, and nothing else (spec,
  // „Checkout page", step 1).
  email: string | null
  billing: BillingDetails
}

// The terms' effective date, recorded on the Order as the version the Student
// agreed to. Must match the date at the foot of `app/pages/obchodni-podminky.vue`.
// A constant until the legal-documents area (area 10 in
// `.aiwork/2026-06-09_kurzy-platforma/areas.md`) makes document versions data.
export const TERMS_VERSION = "2026-01-28"

// The Consents an Order is created with. A list, because area 10 may add the
// § 1837 waiver next to the terms; deliberately not the GDPR policy, which the
// Checkout only informs about and never asks consent for.
export function checkoutConsents(): { document: "terms"; document_version: string }[] {
  return [{ document: "terms", document_version: TERMS_VERSION }]
}

// Only the newest candidate is offered, because an older one can only exist
// if it was already passed over (spec, „Order flow").
export function reusableOrder(orders: Order[]): Order | undefined {
  return orders
    .filter((order) => order.status === "created" && order.gopay_payment_id !== undefined)
    .toSorted((a, b) => b.id - a.id)[0]
}

// A route's `createError({ statusMessage, message })` arrives in the thrown
// error's `data`; the error's own `message` is ofetch's technical
// „[GET] …: 409", so only the body is worth showing a Student.
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
