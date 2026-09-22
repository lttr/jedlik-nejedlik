// The shop's answer to `authError`: one error shape for the Checkout, the
// settlement and the Account's shop sections, so three tickets do not invent
// three. `message` carries the Czech text the browser shows; `statusMessage`
// becomes the HTTP reason phrase and must stay ASCII.
export function shopError(statusCode: number, code: string, message: string): Error {
  return createError({ statusCode, statusMessage: code, message })
}

// Absent is 404, worded like Nuxt's own route miss. A draft Course and
// somebody else's Order have to be indistinguishable from a URL that never
// existed (ADR 0004), so every shop read that comes up empty answers this
// and nothing more specific.
export function notFound(): Error {
  return createError({ statusCode: 404, statusMessage: "Page not found" })
}

export const shopMessages = {
  // The two ways a Course is not buyable. Both are 409: the Course is real and
  // readable, the order just cannot be placed.
  alreadyEntitled: "Tenhle kurz už máte. Najdete ho v Mém účtu.",
  notForSale: "Tenhle kurz zatím není v prodeji.",

  consentRequired: "Bez souhlasu s obchodními podmínkami objednávku dokončit nejde.",
  tooManyCheckouts: "Příliš mnoho pokusů o objednávku. Zkuste to prosím za chvíli.",

  // „Fakturační údaje" on the Account page.
  billingInvalid: "Fakturační údaje se nepodařilo přečíst. Zkontrolujte je prosím.",
  billingUnsaved: "Fakturační údaje se teď nepodařilo uložit. Zkuste to prosím za chvíli.",
  tooManyBillingSaves: "Příliš mnoho pokusů o uložení. Zkuste to prosím za chvíli.",

  // Read by GoPay's retry loop rather than by a person, but the shape stays
  // the same as every other refusal so the limiter needs no second contract.
  tooManyNotifications: "Příliš mnoho oznámení o platbě. Zkuste to prosím za chvíli.",
  tooManySettlementChecks: "Příliš mnoho dotazů na platbu. Zkuste to prosím za chvíli.",

  // Covers the gateway too: a Payment GoPay would not create fails the same
  // press as an Order Directus would not write, and the Student can do the
  // same one thing about either.
  checkoutUnavailable: "Objednávku se teď nepodařilo vytvořit. Zkuste to prosím za chvíli.",
} as const

// Logs the cause for us and shows the Student one generic sentence, exactly
// as `unexpectedAuthError` does for the auth layer.
export function unexpectedShopError(context: string, cause: unknown, message: string): Error {
  console.error(`[shop] ${context}`, cause)
  return shopError(502, "shop_unavailable", message)
}
