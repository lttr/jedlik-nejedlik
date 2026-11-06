import { DESATERO_PATH } from "../components/ebook-cukrovi/content"
import { EBOOK_PATH } from "../components/home/content"

/** The e-book's sale window, both days inclusive, in Prague time. */
const OFFER_FIRST_DAY = "2026-11-09"
const OFFER_LAST_DAY = "2026-12-20"

const SNOOZE_DAYS = 14

/**
 * The homepage (its e-book band sits right under the hero), the e-book page and
 * the desatero sign-up, checkout, shop and auth, the professionals' section and
 * the privacy policy the cookie bar links to.
 */
const SKIPPED_PATHS = [
  "/",
  EBOOK_PATH,
  "/objednavka",
  "/kurzy",
  "/muj-ucet",
  "/prihlaseni",
  "/registrace",
  "/obnova-hesla",
  "/overeni-emailu",
  DESATERO_PATH,
  "/pro-odborniky",
  "/zasady-zpracovani-osobnich-udaju",
]

export interface EbookBannerRecord {
  /** `converted` caps forever, `dismissed` for {@link SNOOZE_DAYS}. */
  status: "dismissed" | "converted"
  at: string
}

export function isSkippedPath(path: string): boolean {
  if (path.startsWith("/dekujeme-")) {
    return true
  }
  return SKIPPED_PATHS.some((skipped) => path === skipped || path.startsWith(`${skipped}/`))
}

export function isCapped(record: EbookBannerRecord | null, now: Date): boolean {
  if (!record) {
    return false
  }
  if (record.status === "converted") {
    return true
  }
  const snoozedUntil = new Date(record.at).getTime() + SNOOZE_DAYS * 24 * 60 * 60 * 1000
  return now.getTime() < snoozedUntil
}

export function isInSeason(now: Date): boolean {
  const pragueDay = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Prague" })
  return pragueDay >= OFFER_FIRST_DAY && pragueDay <= OFFER_LAST_DAY
}

export function canOfferEbook(path: string, record: EbookBannerRecord | null, now: Date): boolean {
  return isInSeason(now) && !isSkippedPath(path) && !isCapped(record, now)
}
