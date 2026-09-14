import { describe, expect, it } from "vitest"

import {
  orphanSalesContentSlugs,
  resolveSalesContent,
} from "../../layers/shop/app/utils/sales-content"

// The lookup takes the registry as an argument so the test owns its map:
// what a component is does not matter here, only whether a slug resolves.
const Bespoke = { name: "Bespoke" }
const registry = { "kurz-s-obsahem": Bespoke }

describe("resolveSalesContent", () => {
  it("returns the component registered for the slug", () => {
    expect(resolveSalesContent("kurz-s-obsahem", registry)).toBe(Bespoke)
  })

  it("returns null for a slug without an entry", () => {
    expect(resolveSalesContent("kurz-bez-obsahu", registry)).toBeNull()
  })
})

describe("orphanSalesContentSlugs", () => {
  it("names every registry key that matches no course", () => {
    const orphans = orphanSalesContentSlugs(["jiny-kurz"], { ...registry, "smazany-kurz": Bespoke })
    expect(orphans).toEqual(["kurz-s-obsahem", "smazany-kurz"])
  })

  it("is empty when every key has its course", () => {
    expect(orphanSalesContentSlugs(["kurz-s-obsahem", "jiny-kurz"], registry)).toEqual([])
  })
})
