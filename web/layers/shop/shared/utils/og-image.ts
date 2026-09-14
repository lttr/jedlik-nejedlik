// The social preview of a Sales Page is the cover put through a Directus
// image transformation (spec, "Metadata and structured data"): 1200×630 is
// the Open Graph size every network crops to, and `fit=cover` keeps the
// frame filled whatever the cover's own aspect ratio.
//
// Hand-built rather than `$img()`: the `@nuxt/image` Directus provider bakes
// its base URL in at build time, while the Directus origin the site really
// talks to is the runtime `directusUrl`, so the two could disagree. The URL
// is absolute because crawlers reject a relative og:image.
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export function courseOgImageUrl(directusUrl: string, coverId: string): string {
  const url = new URL(`/assets/${coverId}`, directusUrl)
  url.searchParams.set("width", String(OG_IMAGE_WIDTH))
  url.searchParams.set("height", String(OG_IMAGE_HEIGHT))
  url.searchParams.set("fit", "cover")
  return url.href
}
