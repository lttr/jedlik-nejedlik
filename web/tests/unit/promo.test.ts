import { describe, expect, it } from "vite-plus/test"
import type { Promo } from "~/components/layout/promo"
import { isPromoShownOn } from "~/components/layout/promo"

const PROMO: Promo = {
  id: "x",
  label: "Label",
  name: "Name",
  price: "1 Kč",
  cta: "Go",
  to: "/produkt",
  hiddenOn: ["/produkt", "/sbirka"],
}

describe("isPromoShownOn", () => {
  it.each([
    "/",
    "/objednavka",
    "/objednavka/kurz-x",
    "/dekujeme-za-zajem-o-newsletter",
    "/produkt",
    "/sbirka/neco",
  ])("hides on %s", (path) => {
    expect(isPromoShownOn(PROMO, path)).toBe(false)
  })

  it.each(["/pro-rodice", "/clanky/neco", "/produktivita", "/objednavkami"])(
    "shows on %s",
    (path) => {
      expect(isPromoShownOn(PROMO, path)).toBe(true)
    },
  )
})
