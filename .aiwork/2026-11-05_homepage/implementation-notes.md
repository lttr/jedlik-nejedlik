# Implementation notes — Homepage

- **Section order follows the prototype**, not the spec table: hero, e-book
  band, problem router, „Znáte nás z" strip, offers, reviews, about,
  podcast + newsletter. The hero's inline „Znáte nás z" line is dropped;
  the strip below says the same.
- **Open questions Q1–Q5 implemented with their defaults**, pending the
  user's answer, except Q1: no „Celá nabídka" link at all (user: nothing
  from `/kurzy` is promoted yet; add it with the offers hub, area 07); course card without a price,
  consultation „od 250 Kč"; media strip links to the articles (now also on
  the e-book landing); old `homepage/` components still there; local
  branch `homepage`.
- **Band CTA goes to the landing**, not to SimpleShop: „Více o e-booku".
  The landing fires `ViewContent`/`InitiateCheckout`; a direct buy button
  here would skip that page.
- **Doctor's quote is word for word** from her review, not the prototype's
  paraphrase.
- **Shared styles moved to `web/app/assets/css/landing.css`** (scoped to
  `.landing-page`, loaded globally): fallow flagged the homepage copying the
  e-book page's typography, hero and chips. The media strip became
  `components/MediaStrip.vue`, used by both pages.
- **Swap after Christmas, by hand:** the e-book band, the e-book card and
  the hero's second CTA in `pages/(homepage)/index.vue` and
  `components/home/content.ts`, until area 08.
- **Not verified:** the newsletter form submit (it would add a real
  subscriber); it is the same `NewsletterForm` and redirect as
  `/cukrovickove-desatero`. Lighthouse not run.
