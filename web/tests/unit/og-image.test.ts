import { describe, expect, it } from "vitest"

import { courseOgImageUrl } from "#layers/shop/shared/utils/og-image"

describe("courseOgImageUrl", () => {
  it("builds an absolute 1200×630 cover transform on the Directus origin", () => {
    expect(courseOgImageUrl("https://obsah.example", "749f89ba-0eff-4923-8f21-5034c60b123b")).toBe(
      "https://obsah.example/assets/749f89ba-0eff-4923-8f21-5034c60b123b?width=1200&height=630&fit=cover",
    )
  })

  it("does not double a trailing slash on the origin", () => {
    expect(courseOgImageUrl("https://obsah.example/", "abc")).toBe(
      "https://obsah.example/assets/abc?width=1200&height=630&fit=cover",
    )
  })
})
