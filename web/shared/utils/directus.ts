export const DIRECTUS_URL = "https://obsah-jedlika.lttr.cz"

export function getImageUrl(cover: string) {
  return `${DIRECTUS_URL}/assets/${cover}`
}
