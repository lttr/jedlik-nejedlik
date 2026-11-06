/**
 * Copy of the homepage. Claims marked `CLAIM` wait for Zdeňka's
 * confirmation, as on the e-book landing.
 */

export const EBOOK_PATH = "/ebook-vanocni-cukrovi"

export const PROBLEMS_ANCHOR = "s-cim-potrebujete-pomoct"

/** Directus file id, the same portrait as on the e-book landing. */
export const ZDENKA_PHOTO_ID = "a64de3ab-044d-46c7-9e4c-64f3854e93d0"

/** Directus file id, Zdeňka lecturing (also on /o-nas). */
export const LECTURE_PHOTO_ID = "658ad6bf-386d-4d5c-bb6c-1f0206930f5a"

export const PROBLEMS = [
  {
    icon: "bi:emoji-frown",
    color: "var(--color-star)",
    title: "Moje dítě nejí",
    text: "Odmítá nové potraviny, jí jen pár věcí a stolování je každodenní boj.",
    cta: "Co s tím",
    to: "/nejedlik",
  },
  {
    icon: "bi:heart",
    color: "var(--color-pale-blue)",
    title: "Moje dítě má nadváhu",
    text: "Bez strašení, diet a srovnávání. Hledáme změny, které vaše rodina zvládne dlouhodobě.",
    cta: "Jak pomáháme",
    to: "/nadvaha",
  },
  {
    icon: "bi:flower1",
    color: "var(--color-light-lime)",
    title: "Chci předcházet",
    text: "Zdravý vztah k jídlu od příkrmů po školní svačiny. Dřív, než nastane problém.",
    cta: "Inspirace a materiály",
    to: "/prevence",
  },
]

export const OFFERS = [
  {
    kind: "E-book",
    color: "var(--color-brick-red)",
    title: "Cukroví s dětmi a v pohodě",
    text: "Vánoce bez bitev o sladké. Tipy podle věku dítěte.",
    price: "290 Kč",
    to: EBOOK_PATH,
  },
  {
    kind: "Online kurz",
    color: "var(--color-pale-blue)",
    title: "Kurz pro rodiče dětí s nadváhou 3–7 let",
    text: "Laskavé vedení a změny, které zvládne celá rodina.",
    price: undefined,
    to: "/2026-online-kurz-deti",
  },
  {
    kind: "Konzultace",
    color: "var(--color-light-lime)",
    title: "Individuální konzultace",
    text: "Osobně nebo online. Rozbor jídelníčku i videa stolování.",
    price: "od 250 Kč",
    to: "/konzultace-deti-obezita",
  },
]

// CLAIM: founding year, consultations online
export const ABOUT_FACTS = ["Nezisková organizace od roku 2023", "Poradna osobně i online"]

export const SPOTIFY_URL = "https://open.spotify.com/show/7DdV5v4nOSVHLWij5Y9a0p"
