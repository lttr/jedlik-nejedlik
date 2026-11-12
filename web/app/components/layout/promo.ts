import { DESATERO_PATH, PRICE } from "../ebook-cukrovi/content"
import { EBOOK_PATH } from "../home/content"

export interface Promo {
  /** Keys the dismissal, so the next promo shows even to whoever closed this one. */
  id: string
  label: string
  /** Set in bold after {@link label}. */
  name: string
  price: string
  cta: string
  to: string
  /** Pages that already make the same offer, matched with their subpages. */
  hiddenOn: string[]
}

/** `null` takes the bar down. The promotion ends by hand, not on a date. */
export const CURRENT_PROMO: Promo | null = {
  id: "ebook-cukrovi",
  label: "Novinka na Vánoce: e-book",
  name: "Cukroví s\u00A0dětmi a\u00A0v\u00A0pohodě",
  price: PRICE,
  cta: "Chci vědět víc",
  to: EBOOK_PATH,
  hiddenOn: [EBOOK_PATH, DESATERO_PATH],
}

/** The homepage carries its own offer band; checkout and thank-you pages stay quiet. */
function isQuietPath(path: string): boolean {
  return (
    path === "/" ||
    path === "/objednavka" ||
    path.startsWith("/objednavka/") ||
    path.startsWith("/dekujeme-")
  )
}

export function isPromoShownOn(promo: Promo, path: string): boolean {
  if (isQuietPath(path)) {
    return false
  }
  return !promo.hiddenOn.some((hidden) => path === hidden || path.startsWith(`${hidden}/`))
}
