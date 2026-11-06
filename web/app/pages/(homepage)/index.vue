<template>
  <div class="landing-page">
    <section class="hero p-full-bg">
      <div class="hero-circle" aria-hidden="true"></div>
      <div class="hero-grid">
        <div>
          <h1 class="hero-title">Výživa a&nbsp;výchova v&nbsp;propojení</h1>
          <p class="lead hero-lead">
            Pomáháme rodičům zvládat náročné situace kolem jídla, ať jde o&nbsp;nejedlíka, nebo
            o&nbsp;nadváhu. Bez strašení, bez diet a&nbsp;s&nbsp;respektem k&nbsp;dítěti
            i&nbsp;k&nbsp;realitě vaší rodiny.
          </p>
          <div class="hero-cta">
            <a :href="`#${PROBLEMS_ANCHOR}`" class="button">S&nbsp;čím potřebujete pomoct?</a>
            <NuxtLink :to="EBOOK_PATH" class="button outline">E-book Cukroví s&nbsp;dětmi</NuxtLink>
          </div>
          <p class="hero-media">
            <strong>Znáte nás z</strong>
            <a
              v-for="outlet of MEDIA_OUTLETS"
              :key="outlet.name"
              :href="outlet.href"
              target="_blank"
              rel="noopener"
              >{{ outlet.fromName }}</a
            >
          </p>
        </div>
        <figure class="hero-photo">
          <NuxtImg
            :src="ZDENKA_PHOTO_ID"
            provider="directus"
            width="460"
            height="575"
            alt="Zdeňka Trummová"
            fetchpriority="high"
          />
          <figcaption>
            <strong>Zdeňka Trummová</strong>
            <span
              >Nutriční poradkyně, pedagožka a&nbsp;zakladatelka neziskovky Jedlík-nejedlík</span
            >
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="offer-band p-full-bg" aria-label="Aktuální nabídka: e-book">
      <div class="offer-band-grid">
        <div class="offer-band-cover">
          <EbookCover />
        </div>
        <div>
          <span class="eyebrow">Na Vánoce 2026</span>
          <h2 class="offer-band-title">Vánoce bez bitev o&nbsp;cukroví. I&nbsp;u&nbsp;babičky.</h2>
          <p>
            Praktický průvodce, jak dát dětem sladké, neztratit nervy a&nbsp;přitom budovat zdravý
            vztah k&nbsp;jídlu. Tipy podle věku od miminek po školáky.
          </p>
        </div>
        <div class="offer-band-price">
          <strong>290&nbsp;Kč</strong>
          <span>PDF hned do e-mailu</span>
          <NuxtLink :to="EBOOK_PATH" class="button cream">Více o&nbsp;e-booku</NuxtLink>
        </div>
      </div>
    </section>

    <section :id="PROBLEMS_ANCHOR" class="section p-full-bg">
      <div>
        <h2 class="section-title">S&nbsp;čím potřebujete pomoct?</h2>
        <p class="lead section-lead">
          Vyberte, co u&nbsp;vás doma právě řešíte. Ke každému tématu najdete rady zdarma, kurzy
          i&nbsp;možnost konzultace.
        </p>
        <ul class="problem-grid">
          <li v-for="problem of PROBLEMS" :key="problem.to">
            <NuxtLink :to="problem.to" class="problem-card" :style="{ '--card-bg': problem.color }">
              <span class="problem-icon"><Icon :name="problem.icon" aria-hidden="true" /></span>
              <h3>{{ problem.title }}</h3>
              <p>{{ problem.text }}</p>
              <span class="card-cta">{{ problem.cta }} →</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <MediaStrip label="Znáte nás z" class="media" />

    <section class="section p-full-bg">
      <div>
        <h2 class="section-title">Aktuální nabídka</h2>
        <p class="lead section-lead">
          Kurzy, webináře a&nbsp;e-booky na jednom místě. Placené i&nbsp;zdarma.
        </p>
        <ul class="offer-grid">
          <li v-for="offer of OFFERS" :key="offer.to">
            <NuxtLink :to="offer.to" class="offer-card" :style="{ '--card-bg': offer.color }">
              <div class="offer-top">
                <span class="offer-kind">{{ offer.kind }}</span>
              </div>
              <div class="offer-body">
                <h3>{{ offer.title }}</h3>
                <p>{{ offer.text }}</p>
                <div class="offer-foot">
                  <strong v-if="offer.price">{{ offer.price }}</strong>
                  <span class="card-cta">Detail →</span>
                </div>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <section class="section reviews p-full-bg">
      <div>
        <h2 class="section-title">Co o&nbsp;nás říkají lékaři a&nbsp;rodiče</h2>
        <div class="review-grid">
          <figure class="review-card doctor">
            <Icon name="bi:quote" class="quote-mark" aria-hidden="true" />
            <blockquote>
              E-book je napsaný s&nbsp;velkým respektem jak k&nbsp;rodičům, tak k&nbsp;dětem.
              Oceňuji, že nesklouzává k&nbsp;žádným extrémům – místo toho předkládá různé reálné
              a&nbsp;rodičovsky proveditelné přístupy.
            </blockquote>
            <figcaption>
              <img :src="DOCTOR_REVIEW.image" alt="" class="avatar" width="48" height="48" />
              <span
                ><strong>{{ DOCTOR_REVIEW.name }}</strong
                >, dětská lékařka</span
              >
            </figcaption>
          </figure>
          <div class="review-stack">
            <figure v-for="review of PARENT_QUOTES" :key="review.name" class="review-card">
              <blockquote>{{ review.quote }}</blockquote>
              <figcaption>
                <strong>{{ review.name }}</strong> · {{ review.role }}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>

    <section class="section p-full-bg">
      <div class="about">
        <NuxtImg
          :src="LECTURE_PHOTO_ID"
          provider="directus"
          width="640"
          height="427"
          alt="Zdeňka Trummová přednáší rodičům"
          class="about-photo"
          loading="lazy"
        />
        <div>
          <span class="pill green">O&nbsp;nás</span>
          <h2 class="section-title about-title">Víme, jaké to je. Zdeňka to zažila sama.</h2>
          <!-- CLAIM: bio -->
          <p class="lead">
            Zakladatelka Zdeňka Trummová od dětství bojovala s&nbsp;obezitou. Jako učitelka pak
            viděla, kolik rodin řeší totéž – a&nbsp;z&nbsp;pedagožky se stala nutriční poradkyní.
            Dnes je Jedlík-nejedlík nezisková organizace, která přednáší rodičům, radí
            v&nbsp;poradně a&nbsp;vzdělává odborníky.
          </p>
          <ul class="chips">
            <li v-for="fact of ABOUT_FACTS" :key="fact">{{ fact }}</li>
          </ul>
          <NuxtLink to="/o-nas" class="button about-cta">Více o&nbsp;nás a&nbsp;týmu</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section closing p-full-bg">
      <div class="closing-grid">
        <div class="podcast">
          <span class="podcast-icon"><Icon name="bi:mic" aria-hidden="true" /></span>
          <h2 class="sub-title">Podcast Jedlík-nejedlík</h2>
          <p>
            Jak u&nbsp;dětí podporovat zdravý postoj k&nbsp;jídlu a&nbsp;nepokazit si přitom
            vzájemný vztah. Každý měsíc poradna s&nbsp;odpověďmi na vaše dotazy.
          </p>
          <div class="podcast-links">
            <a :href="SPOTIFY_URL" class="button cream" target="_blank" rel="noopener"
              >Poslouchat na Spotify</a
            >
            <NuxtLink to="/podcast" class="button outline-light">O&nbsp;podcastu</NuxtLink>
          </div>
        </div>
        <div class="newsletter">
          <NewsletterForm
            title="Newsletter pro rodiče"
            description="Tipy, novinky a&nbsp;inspirace ze světa dětské výživy."
            highlight="Jako dárek za přihlášení vám pošleme Cukrovíčkové desatero."
            button-text="Chci desatero"
            redirect-path="/dekujeme-za-zajem-o-newsletter?pdf=cukrovickove-desatero"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DOCTOR_REVIEW, PARENT_REVIEWS } from "~/components/ebook-cukrovi/content"
import EbookCover from "~/components/ebook-cukrovi/EbookCover.vue"
import {
  ABOUT_FACTS,
  EBOOK_PATH,
  LECTURE_PHOTO_ID,
  OFFERS,
  PROBLEMS,
  PROBLEMS_ANCHOR,
  SPOTIFY_URL,
  ZDENKA_PHOTO_ID,
} from "~/components/home/content"
import { MEDIA_OUTLETS } from "~/components/media-outlets"
import MediaStrip from "~/components/MediaStrip.vue"
import NewsletterForm from "~/components/NewsletterForm.vue"

definePageMeta({
  layout: "homepage",
})

const PULL_QUOTES: Record<string, string> = {
  "Alena Rejfková":
    "E-book od Zdeňky je nabitý informacemi, napsáno polopaticky i pro laika. Laskavá forma a plno praktických tipů.",
  "Kateřina Zavřelová":
    "Není to tak docela o cukroví, jako spíš o celkovém přístupu k jídlu i k dětem.",
}

const PARENT_QUOTES = PARENT_REVIEWS.flatMap((review) => {
  const quote = PULL_QUOTES[review.name]
  return quote === undefined ? [] : [{ name: review.name, role: review.role, quote }]
})
</script>

<style scoped>
.section-lead {
  max-width: 45rem;
}

.offer-band .eyebrow {
  color: var(--color-peach);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  padding-inline: var(--space-6);
  border: 2px solid var(--color-navy);
  border-radius: var(--radius-round);
  background-color: var(--color-navy);
  color: white;
  font-size: 1rem;
  font-weight: var(--font-weight-6);
  text-align: center;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: var(--brand-color-bright);
    background-color: var(--brand-color-bright);
    color: white;
  }

  &.outline {
    background-color: transparent;
    color: var(--color-navy);

    &:hover {
      border-color: var(--color-navy);
      background-color: var(--color-navy);
      color: white;
    }
  }

  &.cream {
    border-color: var(--cream);
    background-color: var(--cream);
    color: var(--color-navy);

    &:hover {
      border-color: white;
      background-color: white;
    }
  }

  &.outline-light {
    border-color: color-mix(in srgb, white 45%, transparent);
    background-color: transparent;

    &:hover {
      border-color: white;
      background-color: transparent;
    }
  }
}

.card-cta {
  font-weight: var(--font-weight-6);
}

/* Hero */
.hero {
  padding-block: var(--space-8) var(--space-9);
}

.hero-circle {
  top: calc(-1 * var(--space-6));
  right: -160px;
  width: 620px;
  background-color: color-mix(in srgb, var(--color-light-lime) 55%, white);

  @media (--lg-n-below) {
    top: auto;
    right: 50%;
    bottom: var(--space-6);
    width: 420px;
    transform: translateX(50%);
  }
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  margin-top: var(--space-6);
}

.hero-media {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-1) var(--space-3);
  margin-top: var(--space-5);
  font-size: var(--font-size--1);
  color: color-mix(in srgb, var(--color-navy) 72%, white);

  strong {
    color: var(--color-navy);
  }

  a + a::before {
    content: "·" / "";
    display: inline-block;
    margin-right: var(--space-3);
  }

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.hero-photo {
  position: relative;
  width: min(100%, 26rem);
  margin: 0 auto;

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    border-radius: 240px 240px var(--radius-4) var(--radius-4);
  }

  figcaption {
    position: absolute;
    bottom: var(--space-6);
    left: calc(-1 * var(--space-5));
    display: flex;
    flex-direction: column;
    max-width: 17rem;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-3);
    background: white;
    box-shadow: var(--card-shadow);
    font-size: var(--font-size--1);
    line-height: 1.4;
    text-align: start;

    span {
      color: var(--muted);
    }

    @media (--lg-n-below) {
      left: var(--space-3);
    }
  }
}

/* Offer band */
.offer-band {
  padding-block: var(--space-7);
  background-color: var(--color-brick-red);
  color: white;

  p {
    margin-top: var(--space-2);
    color: color-mix(in srgb, var(--color-peach) 85%, white);
  }
}

.offer-band-grid {
  display: grid;
  grid-template-columns: 11rem 1fr auto;
  gap: var(--space-7);
  align-items: center;

  @media (--md-n-below) {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
}

.offer-band-cover {
  @media (--md-n-below) {
    width: 9rem;
  }
}

.offer-band-title {
  margin-top: var(--space-2);
  font-size: clamp(var(--font-size-2), 2.6vw, var(--font-size-3));
  font-weight: var(--font-weight-7);
  line-height: 1.15;
  color: var(--color-peach);
  text-wrap: balance;
}

.offer-band-price {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);

  strong {
    font-size: var(--font-size-3);
    color: var(--color-peach);
  }

  span {
    margin-bottom: var(--space-3);
    font-size: var(--font-size--1);
  }
}

/* Problem router */
.problem-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
  margin-top: var(--space-7);
  padding: 0;
  list-style: none;

  @media (--lg-n-below) {
    grid-template-columns: 1fr;
  }

  > li {
    display: flex;
  }
}

.problem-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: var(--space-6);
  border-radius: var(--radius-4);
  background-color: var(--card-bg);
  color: var(--color-navy);
  text-decoration: none;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-3px);
  }

  h3 {
    margin-top: var(--space-5);
    font-size: var(--font-size-2);
    line-height: 1.2;
  }

  p {
    flex: 1;
    margin-top: var(--space-2);
    line-height: 1.55;
  }

  .card-cta {
    margin-top: var(--space-5);
  }
}

.problem-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--radius-round);
  background: color-mix(in srgb, white 70%, transparent);
  font-size: 1.4rem;
}

.media {
  border-bottom: 0;
  background-color: var(--cream);
}

/* Offers */
.offer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
  gap: var(--space-5);
  margin-top: var(--space-7);
  padding: 0;
  list-style: none;

  > li {
    display: flex;
  }
}

.offer-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  border-radius: var(--radius-4);
  background: white;
  box-shadow: var(--card-shadow);
  color: var(--color-navy);
  text-decoration: none;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.offer-top {
  display: flex;
  flex: none;
  align-items: flex-end;
  height: 6rem;
  padding: var(--space-4);
  background-color: var(--card-bg);
}

.offer-kind {
  padding: 2px 12px;
  border-radius: var(--radius-round);
  background: white;
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-6);
}

.offer-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: var(--space-5);

  h3 {
    font-size: var(--font-size-1);
    line-height: 1.3;
  }

  p {
    flex: 1;
    margin-top: var(--space-2);
    font-size: var(--font-size--1);
    line-height: 1.55;
    color: var(--muted);
  }
}

.offer-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-5);

  .card-cta {
    margin-left: auto;
    color: var(--color-brick-red);
  }
}

/* Reviews */
.reviews {
  background-color: color-mix(in srgb, var(--color-pale-blue) 22%, white);
}

.review-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: var(--space-5);
  margin-top: var(--space-7);

  @media (--lg-n-below) {
    grid-template-columns: 1fr;
  }
}

.review-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.review-card {
  margin: 0;
  padding: var(--space-6);
  border-radius: var(--radius-4);
  background: white;
  box-shadow: var(--card-shadow);

  blockquote {
    margin: 0;
    padding: 0;
    border: 0;
    font-style: normal;
    font-weight: var(--font-weight-6);
    line-height: 1.5;
  }

  figcaption {
    margin-top: var(--space-4);
    font-size: var(--font-size--1);
    color: var(--muted);
    text-align: start;

    strong {
      color: var(--color-navy);
    }
  }

  &.doctor {
    blockquote {
      font-size: var(--font-size-1);
      font-weight: var(--font-weight-5);
    }

    figcaption {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }
  }
}

.quote-mark {
  margin-bottom: var(--space-3);
  font-size: 2.5rem;
  color: var(--color-pale-blue);
}

/* About */
.about {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  align-items: center;

  @media (--lg-n-below) {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

.about-photo {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius-4);
}

.about-title {
  margin-top: var(--space-4);
}

.about-cta {
  margin-top: var(--space-6);
}

/* Podcast + newsletter */
.closing {
  padding-top: 0;
}

.closing-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: var(--space-5);
  align-items: start;

  @media (--lg-n-below) {
    grid-template-columns: 1fr;
  }
}

.podcast {
  padding: var(--space-7);
  border-radius: var(--radius-4);
  background-color: var(--color-navy);
  color: white;

  h2 {
    margin-top: var(--space-5);
  }

  p {
    margin-top: var(--space-3);
    color: var(--on-dark-muted);
  }

  @media (--md-n-below) {
    padding: var(--space-5);
  }
}

.podcast-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--radius-round);
  background-color: var(--color-light-lime);
  color: var(--color-navy);
  font-size: 1.4rem;
}

.podcast-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.newsletter {
  padding: var(--space-7);
  border-radius: var(--radius-4);
  background-color: var(--color-peach);

  @media (--md-n-below) {
    padding: var(--space-5);
  }
}
</style>
