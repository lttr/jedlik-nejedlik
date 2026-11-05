import { DESATERO_PATH } from "../components/ebook-cukrovi/content"

/** Last day the pop-up is offered, inclusive, in Prague time. */
const OFFER_LAST_DAY = "2026-12-24"

const SNOOZE_DAYS = 14

/**
 * Checkout, shop and auth, the sign-up funnel itself, the e-book page (it has
 * its own desatero box), the professionals' section and the privacy policy the
 * cookie bar links to.
 */
const SKIPPED_PATHS = [
  "/objednavka",
  "/kurzy",
  "/muj-ucet",
  "/prihlaseni",
  "/registrace",
  "/obnova-hesla",
  "/overeni-emailu",
  DESATERO_PATH,
  "/ebook-vanocni-cukrovi",
  "/pro-odborniky",
  "/zasady-zpracovani-osobnich-udaju",
]

export interface DesateroPopupRecord {
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

export function isCapped(record: DesateroPopupRecord | null, now: Date): boolean {
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
  return pragueDay <= OFFER_LAST_DAY
}

export function canOfferDesatero(
  path: string,
  record: DesateroPopupRecord | null,
  now: Date,
): boolean {
  return isInSeason(now) && !isSkippedPath(path) && !isCapped(record, now)
}
