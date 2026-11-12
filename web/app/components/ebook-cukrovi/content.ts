/**
 * Copy of the e-book landing page (/ebook-vanocni-cukrovi). Claims marked
 * `CLAIM` wait for Zdeňka's confirmation, see
 * .aiwork/2026-11-05_ebook-landing/spec.md, „Claims to confirm".
 */

export const PURCHASE_URL = "https://form.simpleshop.cz/GXDmm/buy/"

/** The content name Meta sees on `InitiateCheckout`. */
export const EBOOK_ID = "ebook-cukrovi"

export const PRICE = "290 Kč"

// CLAIM: page count and the three cover badges
export const COVER_BADGES = ["61 stran", "Tipy podle věku", "Tisknutelné listy"]

export const PAIN_POINTS = [
  {
    icon: "bi:people",
    title: "Babička přidává desátý perníček",
    text: "…a vy nevíte, jestli zasáhnout, nebo to nechat být, aby u stolu nebylo dusno.",
  },
  {
    icon: "bi:magnet",
    title: "Konferenční stolek jako magnet",
    text: "Dítě celé odpoledne krouží kolem mísy s cukrovím a každých pět minut se ptá: „Můžu ještě jedno?“",
  },
  {
    icon: "bi:moon-stars",
    title: "Přetažený večer",
    text: "Po návštěvě je dítě plné sladkého a dojmů a nemůže usnout. A vy taky ne.",
  },
  {
    icon: "bi:emoji-frown",
    title: "Pečení, které skončí křikem",
    text: "Chtěli jste pohodu u vykrajování. Skončilo to moukou všude a slzami. Možná i vašimi.",
  },
  {
    icon: "bi:signpost-split",
    title: "Zakázat, nebo povolit?",
    text: "Bojíte se, že zákazy z dítěte udělají mlsouna. Ale bez pravidel to taky nejde.",
  },
]

export const OUTCOMES = [
  {
    title: "Klidnější návštěvy",
    text: "Víte předem, co řeknete babičce i dítěti. Na místě už nic neřešíte.",
  },
  {
    title: "Méně vyjednávání",
    text: "Jasná dohoda místo nekonečného „ještě jedno, prosím“.",
  },
  {
    title: "Pečení bez nervů",
    text: "Aktivity podle věku, takže každé dítě ví, co dělat, a vy máte klid.",
  },
]

// CLAIM: the eight tools match the PDF
export const TOOLS = [
  {
    title: "Hodovní talířek",
    text: "Sladké má své místo i čas. Dítě ví, co a kdy, a vy nehlídáte každý kousek.",
  },
  {
    title: "Krabička na potom",
    text: "Co se nesní hned, nemusí zmizet. Jednoduchý trik proti „ještě jedno“.",
  },
  {
    title: "Degustační hra",
    text: "Ochutnávání místo hltání. Dítě poznává chutě a učí se, kdy má dost.",
  },
  {
    title: "Dohoda před návštěvou",
    text: "Dvě varianty, které s dítětem domluvíte předem. Na místě už nevyjednáváte.",
  },
  {
    title: "Jak mluvit s babičkou",
    text: "Věty pro prarodiče, aby se nikdo nedotkl a pravidla platila i u nich.",
  },
  {
    title: "Společně, ale jinak",
    text: "Citlivá kapitola pro rodiče dětí s nadváhou. Slavit stejně, bez vyčleňování.",
  },
  {
    title: "18 aktivit při pečení",
    text: "Rozdělené podle věku, od nejmenších po školáky.",
  },
  {
    title: "První pomoc při zhrouceném pečení",
    text: "Když už to nejde: jak z toho vybruslit a nezkazit si den.",
  },
]

// CLAIM: the age tips match the PDF
export const AGE_TIPS = [
  {
    label: "Do 1 roku",
    title: "První Vánoce s miminkem",
    items: [
      "Jestli a kdy sladké vůbec nabídnout",
      "Perníček bez medu pro miminko",
      "Jak to v klidu vysvětlit příbuzným",
    ],
  },
  {
    label: "1,5–2 roky",
    title: "Dítě začíná chtít, co vidí",
    items: [
      "Jak nastavit rámec dřív, než začne vyjednávat",
      "Krabička na potom v praxi",
      "Bezpečné úkoly při pečení pro nejmenší",
    ],
  },
  {
    label: "Od 2,5 roku",
    title: "Návštěvy a vyjednávání",
    items: [
      "Dohoda před návštěvou se dvěma variantami",
      "Degustační hra místo hltání",
      "Jak odejít z návštěvy bez scény",
    ],
  },
  {
    label: "Od 4 let",
    title: "Společná rodinná pravidla",
    items: [
      "Hodovní talířek a pravidla pro svátky",
      "Dítě jako pomocník v kuchyni i při plánování",
      "Jak mluvit o sladkém bez zákazů a výčitek",
    ],
  },
]

/** Directus file ids of the PDF pages shown in „Nahlédněte dovnitř". */
export const PREVIEW_IMAGE_IDS = [
  "7677b758-7907-4b7b-a7e2-5f121ed3abbc",
  "1c865708-d38d-420f-8c65-33bc6f91f60a",
  "92a7e957-0b44-4db3-ade4-19f68a8db6d9",
]

export const DOCTOR_REVIEW = {
  name: "MUDr. Lenka Veselá",
  role: "Dětská lékařka",
  image: "/images/testimonials/lenka.webp",
  shortQuote: "Nesklouzává k žádným extrémům. Přečetla jsem ho jedním dechem!",
  heading: "Napsaný s velkým respektem k rodičům i k dětem.",
  paragraphs: [
    "E-book je napsaný s velkým respektem jak k rodičům, tak k dětem. Nabízí jemné, ale praktické vedení, jak prožít období Vánoc i dalších oslav s větším klidem, bez zbytečného stresu a s důrazem na posilování zdravého vztahu dítěte k jídlu. Oceňuji, že nesklouzává k žádným extrémům – místo toho předkládá různé reálné a rodičovsky proveditelné přístupy, které mohou pomoci vytvořit doma příjemnější atmosféru. 🎄",
    "Velmi užitečné jsou i tipy na společné pečení vánočního cukroví: jak si ho s dětmi užít, nezbláznit se z nepořádku a zároveň podpořit jejich přirozenou zvědavost. Autorka také nabízí praktické rady, jak zvládnout návštěvy a rodinná setkání, kde bývá jídla ‚až až‘, a přesto si uchovat pohodu.",
    "Hlavním poselstvím e-booku je, že budování zdravého vztahu dítěte k jídlu je proces – někdy náročný, ale rozhodně nemusí být raketovou vědou. Stačí drobné, soucitné kroky, které se postupně skládají v dlouhodobý efekt.",
    "E-book doporučuji všem rodičům, kteří se o vztah svých dětí k jídlu zajímají a hledají inspiraci, jak na něm citlivě pracovat. Přečetla jsem ho jedním dechem!",
  ],
}

export const PARENT_REVIEWS = [
  {
    name: "Alena Rejfková",
    role: "speciální pedagožka, máma osmileté slečny a pětiletého syna",
    image: "/images/testimonials/alena.webp",
    heading: "Nabité informacemi, napsané polopaticky.",
    quote:
      "E-book od Zdeňky je nabitý informacemi, napsáno polopaticky i pro laika. Laskavá forma a plno praktických tipů. Děkuji a moc doporučuji.",
  },
  {
    name: "Andrea Slavíková",
    role: "maminka Máti (4,5) a Madlenky",
    image: "/images/testimonials/andrea.webp",
    heading: "Pomohl mi už před synovými prvními Vánoci.",
    quote:
      "E-book jsem si zakoupila před synovými prvními Vánoci (tedy těmi opravdovými, když mu bylo rok a půl). Neměla jsem úplně ujasněné, jak přistoupit k celému systému koloběhu cukru a čokolád. Díky e-booku jsem získala představu, co a jak můžu udělat, abych se cítila dobře já i syn. Teď, když jsem se ke čtení vrátila (synovi je 4,5), tak i velmi oceňuji kroky, jak prožít návštěvy u rodiny a známých.",
  },
  {
    name: "Kateřina Zavřelová",
    role: "maminka tří malých indiánek",
    image: "/images/testimonials/katerina.webp",
    heading: "Není to jen o cukroví.",
    quote:
      "Vlastně mě (příjemně) překvapilo, že jsem po přečtení zjistila, že to není tak docela o cukroví, jako spíš o celkovém přístupu k jídlu i k dětem. A přestože doma v tomto nejsme na začátku, našla jsem si tam spoustu tipů, které jsem do dalšího vánočního období už zapojila. Manžel si z dětství nese špatnou zkušenost se zdravým cukrovím, které mu vůbec nechutnalo, a tak hledáme cesty, jak mít vánoční stůl příjemný pro všechny.",
  },
]

export const AUTHOR_PHOTO_ID = "a64de3ab-044d-46c7-9e4c-64f3854e93d0"

// CLAIM: bio wording („Od dětství bojovala s vlastní obezitou")
export const AUTHOR_BIO =
  "Od dětství bojovala s vlastní obezitou. Jako učitelka pak viděla, kolik dětí a rodin řeší totéž, a z pedagožky se stala nutriční poradkyní. Dnes vede poradnu Jedlík-nejedlík, studuje nutriční terapii, spolupracuje s lékaři a je mámou dvou holčiček. Opírá se o vědecky podložená data a ověřené postupy, bez strašení a bez nerealistických slibů."

export const AUTHOR_ROLES = [
  "Nutriční poradkyně a pedagožka",
  "Zakladatelka neziskovky Jedlík-nejedlík",
]

// CLAIM: page count, quick start, printable sheets
export const PACKAGE_ITEMS = [
  { before: "E-book v PDF, 61 stran, ", strong: "hned do e‑mailu", after: "" },
  { before: "", strong: "Rychlý start na 2 strany", after: " a tipy podle věku dítěte" },
  {
    before: "",
    strong: "Tisknutelné listy:",
    after: " plán mlsání, checklist před návštěvou, věty pro babičku",
  },
  { before: "Čtení v mobilu, tabletu i vytištěné", strong: "", after: "" },
]

// CLAIM: Mikuláš bonus dates
export const BONUS = {
  title: "Bonus pro nákup do Mikuláše (6. 12.):",
  text: "živé Q&A se Zdeňkou 9. 12. Zeptáte se na to, co řešíte právě vy.",
}

export const FAQ = [
  {
    question: "Pro jak staré děti je e-book?",
    answer:
      "Pro rodiče dětí od miminek po mladší školáky. Čím dřív položíte dobré základy, tím lépe. Rady jsou rozdělené podle věku: do 1 roku, 1,5–2 roky, od 2,5 roku a od 4 let.",
  },
  {
    question: "Jak e-book dostanu?",
    answer:
      "Hned po zaplacení vám přijde e‑mailem jako PDF. Přečtete ho v mobilu, tabletu i počítači, nebo si ho vytisknete.",
  },
  {
    question: "Jsem úplně vyřízená. Je to pro mě?",
    answer:
      "Ano. Začněte rychlým startem: pět kroků na tento týden na dvou stranách. Pomůže vám přípravy kolem cukroví nastavit tak, aby vám o Vánocích neutíkala energie oknem. Zbytek si dočtete, až budete mít chvilku. Jste-li ale silně přetížená, dopřejte si nejdřív odpočinek. I dobré informace jsou v tu chvíli další zátěž.",
  },
  {
    question: "Je to i pro rodiče nejedlíků?",
    answer:
      "Ano. Najdete tu spoustu tipů, jak vzít děti do kuchyně a zažít tam úspěch. Dítě rozšiřuje svůj repertoár potravin i tím, že s jídlem pracuje.",
  },
  {
    question: "Najdu uvnitř recepty?",
    answer:
      "Ne, e-book není kuchařka. Je o tom, jak sladké s dětmi zvládat, ne o přísných návodech nebo zákazech. Recepty na zdravější cukroví sdílíme zdarma na sociálních sítích.",
  },
  {
    question: "Pomůže to, i když máme doma chaos?",
    answer: "Ano. E-book vychází z reálných situací rodin, ne z ideálních podmínek.",
  },
]

export const DESATERO_PATH = "/cukrovickove-desatero"
