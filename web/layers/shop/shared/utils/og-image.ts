// A Directus image transformation built by hand, not by `$img()`.
// See docs/shop.md, „Social preview image".
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export function courseOgImageUrl(directusUrl: string, coverId: string): string {
  const url = new URL(`/assets/${coverId}`, directusUrl)
  url.searchParams.set("width", String(OG_IMAGE_WIDTH))
  url.searchParams.set("height", String(OG_IMAGE_HEIGHT))
  url.searchParams.set("fit", "cover")
  return url.href
}
