import { describe, expect, it } from "vite-plus/test"
import { canOfferDesatero, isCapped, isInSeason, isSkippedPath } from "~/utils/desatero-popup"

const NOW = new Date("2026-11-20T10:00:00Z")

describe("isSkippedPath", () => {
  it.each([
    "/objednavka/kurz-x",
    "/objednavka/123/navrat",
    "/kurzy",
    "/kurzy/kurz-x",
    "/muj-ucet",
    "/prihlaseni",
    "/registrace",
    "/obnova-hesla",
    "/overeni-emailu",
    "/cukrovickove-desatero",
    "/dekujeme-za-zajem-o-newsletter",
    "/ebook-vanocni-cukrovi",
    "/pro-odborniky/lekari",
    "/zasady-zpracovani-osobnich-udaju",
  ])("skips %s", (path) => {
    expect(isSkippedPath(path)).toBe(true)
  })

  it.each(["/", "/pro-rodice", "/nejedlik", "/kurzyx", "/podcast"])("offers on %s", (path) => {
    expect(isSkippedPath(path)).toBe(false)
  })
})

describe("isCapped", () => {
  it("is open with no record", () => {
    expect(isCapped(null, NOW)).toBe(false)
  })

  it("caps a conversion forever", () => {
    expect(isCapped({ status: "converted", at: "2020-01-01T00:00:00Z" }, NOW)).toBe(true)
  })

  it("snoozes a dismissal for 14 days", () => {
    expect(isCapped({ status: "dismissed", at: "2026-11-07T10:00:01Z" }, NOW)).toBe(true)
    expect(isCapped({ status: "dismissed", at: "2026-11-06T10:00:00Z" }, NOW)).toBe(false)
  })
})

describe("isInSeason", () => {
  it("runs through Christmas Eve in Prague", () => {
    expect(isInSeason(new Date("2026-12-24T22:59:00Z"))).toBe(true)
    expect(isInSeason(new Date("2026-12-24T23:00:00Z"))).toBe(false)
  })
})

describe("canOfferDesatero", () => {
  it("needs season, an eligible path and no cap", () => {
    expect(canOfferDesatero("/", null, NOW)).toBe(true)
    expect(canOfferDesatero("/prihlaseni", null, NOW)).toBe(false)
    expect(canOfferDesatero("/", { status: "converted", at: NOW.toISOString() }, NOW)).toBe(false)
    expect(canOfferDesatero("/", null, new Date("2027-01-02T10:00:00Z"))).toBe(false)
  })
})
