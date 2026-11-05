<template>
  <div class="ebook-page">
    <HeroSection />

    <section class="section p-full-bg">
      <div>
        <div class="section-intro">
          <h2 class="section-title">Znáte to?</h2>
          <p class="lead">
            Advent teprve začal a&nbsp;sladké už je všude. Doma, ve školce i&nbsp;u&nbsp;babičky.
          </p>
        </div>
        <ul class="pain-grid">
          <li
            v-for="(pain, index) of PAIN_POINTS"
            :key="pain.title"
            class="pain-card"
            :style="{ '--icon-bg': PAIN_ICON_COLORS[index] }"
          >
            <span class="pain-icon"><Icon :name="pain.icon" aria-hidden="true" /></span>
            <div>
              <h3>{{ pain.title }}</h3>
              <p>{{ pain.text }}</p>
            </div>
          </li>
        </ul>
        <p class="pain-closing">
          Nejste v&nbsp;tom sami. A&nbsp;dá se to zvládnout jinak než hlídáním každého kousku.
        </p>
      </div>
    </section>

    <section class="section dark p-full-bg">
      <div class="outcomes">
        <h2 class="section-title">Co se u&nbsp;vás změní</h2>
        <p class="lead">
          Jasnost, klid a&nbsp;konkrétní postupy. Nástroje z&nbsp;oblasti
          <strong>výživy, psychologie i&nbsp;rodičovství</strong>.
        </p>
        <ol class="outcome-list">
          <li v-for="outcome of OUTCOMES" :key="outcome.title">
            <strong>{{ outcome.title }}</strong>
            <span>{{ outcome.text }}</span>
          </li>
        </ol>
      </div>
    </section>

    <section class="section p-full-bg">
      <div>
        <div class="section-intro">
          <h2 class="section-title">Co v&nbsp;e-booku najdete</h2>
          <p class="lead">
            Žádná teorie do šuplíku. Pojmenované nástroje, které vyzkoušíte hned o&nbsp;prvním
            adventním víkendu.
          </p>
        </div>
        <ol class="tool-grid">
          <li v-for="tool of TOOLS" :key="tool.title" class="tool-card">
            <h3>{{ tool.title }}</h3>
            <p>{{ tool.text }}</p>
          </li>
        </ol>
        <p class="tools-theory">
          A&nbsp;k&nbsp;tomu <strong>teorie bez strašení</strong>: jak děti na cukroví reagují
          z&nbsp;pohledu výživy, proč rozhozený režim o&nbsp;svátcích všechno zhoršuje a&nbsp;jak
          nastavit laskavé a&nbsp;realistické hranice, které dítěti dávají jistotu.
        </p>

        <div class="age-box">
          <div>
            <span class="eyebrow on-dark">To obecný článek nenabídne</span>
            <h3 class="age-title">Tipy podle věku vašeho dítěte</h3>
            <p>
              Roční miminko potřebuje něco jiného než čtyřleťák. Vyberte věk a&nbsp;podívejte se, co
              pro vás v&nbsp;e-booku je.
            </p>
          </div>
          <AgeTabs />
        </div>

        <div class="preview">
          <div>
            <h3 class="sub-title">Nahlédněte dovnitř</h3>
            <p class="muted">
              Přehledné infobloky, shrnutí <strong>„Co si odnést“</strong> na konci každé kapitoly
              a&nbsp;<strong>rychlý start na dvě strany</strong> pro dny, kdy nemáte čas číst.
            </p>
          </div>
          <PreviewGallery />
        </div>
      </div>
    </section>

    <ReviewsSection />

    <section class="section p-full-bg">
      <div class="author">
        <NuxtImg
          :src="AUTHOR_PHOTO_ID"
          provider="directus"
          width="380"
          height="475"
          alt="Zdeňka Trummová"
          class="author-photo"
          loading="lazy"
        />
        <div>
          <span class="pill green">Kdo e-book napsal</span>
          <h2 class="section-title author-name">Zdeňka Trummová</h2>
          <p class="lead">{{ AUTHOR_BIO }}</p>
          <ul class="chips">
            <li v-for="role of AUTHOR_ROLES" :key="role">{{ role }}</li>
          </ul>
        </div>
      </div>
    </section>

    <PricingSection />

    <section class="section p-full-bg">
      <div class="faq">
        <h2 class="section-title">Časté otázky</h2>
        <FaqList />
      </div>
    </section>

    <section class="section dark final p-full-bg">
      <div>
        <h2 class="section-title">Ať jsou letošní Vánoce hlavně o&nbsp;pohodě.</h2>
        <p class="lead">Stačí si e-book přečíst před prvním pečením. Zbytek už zvládnete.</p>
        <BuyLink size="big" cream class="final-buy" />
        <div class="desatero">
          <div>
            <p class="desatero-title">Ještě váháte?</p>
            <p>Stáhněte si zdarma Cukrovíčkové desatero.</p>
          </div>
          <NuxtLink :to="DESATERO_PATH" class="desatero-link">Chci desatero zdarma</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import AgeTabs from "../components/ebook-cukrovi/AgeTabs.vue"
import BuyLink from "../components/ebook-cukrovi/BuyLink.vue"
import {
  AUTHOR_BIO,
  AUTHOR_PHOTO_ID,
  AUTHOR_ROLES,
  DESATERO_PATH,
  OUTCOMES,
  PAIN_POINTS,
  TOOLS,
} from "../components/ebook-cukrovi/content"
import FaqList from "../components/ebook-cukrovi/FaqList.vue"
import HeroSection from "../components/ebook-cukrovi/HeroSection.vue"
import PreviewGallery from "../components/ebook-cukrovi/PreviewGallery.vue"
import PricingSection from "../components/ebook-cukrovi/PricingSection.vue"
import ReviewsSection from "../components/ebook-cukrovi/ReviewsSection.vue"

const PAIN_ICON_COLORS = [
  "var(--color-star)",
  "var(--color-pale-blue)",
  "var(--color-light-lime)",
  "var(--color-peach)",
  "color-mix(in srgb, var(--color-brick-red) 18%, white)",
]

useSeoMeta({
  title: "Cukroví s dětmi a v pohodě | E-book",
  description:
    "Vánoce bez bitev o cukroví. I u babičky. E-book od nutriční poradkyně: jak dát dětem sladké, neztratit nervy a budovat zdravý vztah k jídlu.",
})
</script>

<!-- Unscoped: the section components on this page share these. -->
<style>
.ebook-page {
  --section-padding: var(--space-9);
  --cream: color-mix(in srgb, var(--color-peach) 45%, white);
  --muted: color-mix(in srgb, var(--color-navy) 72%, white);
  --on-dark-muted: color-mix(in srgb, var(--color-pale-blue) 55%, white);
  --card-shadow: 0 1px 0 rgb(10 26 87 / 6%), 0 10px 30px rgb(10 26 87 / 7%);

  @media (--md-n-below) {
    --section-padding: var(--space-8);

    /* Room for the sticky buy bar. */
    padding-bottom: 4.5rem;
  }

  .section {
    padding-block: var(--section-padding);
  }

  .dark {
    background-color: var(--color-navy);
    color: white;

    .lead {
      color: var(--on-dark-muted);
    }
  }

  .cream {
    background-color: var(--cream);
  }

  .section-title {
    font-size: clamp(var(--font-size-3), 3.4vw, var(--font-size-4));
    font-weight: var(--font-weight-7);
    line-height: 1.12;
    text-wrap: balance;
  }

  .sub-title {
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-7);
    line-height: 1.2;
  }

  .lead {
    margin-top: var(--space-3);
    font-size: var(--font-size-0);
    line-height: 1.6;
    color: var(--muted);
    text-wrap: pretty;
  }

  .muted {
    margin-top: var(--space-3);
    color: var(--muted);
  }

  .eyebrow {
    font-size: var(--font-size--1);
    font-weight: var(--font-weight-6);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .pill {
    display: inline-block;
    padding: 3px 14px;
    border: 1.5px solid currentcolor;
    border-radius: var(--radius-round);
    font-size: var(--font-size--1);
    color: var(--color-brick-red);
  }

  blockquote {
    padding: 0;
    border: 0;
    font-style: normal;
  }

  figcaption {
    text-align: start;
  }

  .avatar {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-round);
    object-fit: cover;
  }

  .avatar.large {
    width: 80px;
    height: 80px;
  }

  .check {
    flex-shrink: 0;
    margin-top: 0.3em;
    color: var(--color-forest-green);
  }
}
</style>

<style scoped>
.section-intro {
  max-width: 45rem;
}

/* Pain points */
.pain-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
  margin-top: var(--space-7);

  @media (--md-n-below) {
    grid-template-columns: 1fr;
  }
  padding: 0;
  list-style: none;
}

.pain-card {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  padding: var(--space-5);
  border-radius: var(--radius-4);
  background: white;
  box-shadow: var(--card-shadow);

  &:last-child {
    grid-column: 1 / -1;
  }

  @media (--md-n-below) {
    flex-direction: column;
    gap: var(--space-3);
  }

  h3 {
    font-size: var(--font-size-1);
    line-height: 1.3;
  }

  p {
    margin-top: var(--space-1);
    line-height: 1.55;
    color: var(--muted);
  }
}

.pain-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--radius-3);
  background-color: var(--icon-bg);
  font-size: 1.5rem;
}

.pain-closing {
  max-width: 45rem;
  margin-top: var(--space-7);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  line-height: 1.4;
}

/* Outcomes */
.outcomes {
  max-width: 48rem;
}

.outcome-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-top: var(--space-7);
  padding: 0;
  list-style: none;
  counter-reset: outcome;

  li {
    display: grid;
    grid-template-columns: 2.75rem 1fr;
    column-gap: var(--space-4);
    counter-increment: outcome;

    &::before {
      content: counter(outcome);
      grid-row: span 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: var(--radius-round);
      background-color: var(--color-light-lime);
      color: var(--color-navy);
      font-weight: var(--font-weight-7);
    }

    &:nth-child(2)::before {
      background-color: var(--color-star);
    }

    &:nth-child(3)::before {
      background-color: var(--color-pale-blue);
    }
  }

  /* As tall as the number circle, so the first line centres on it. */
  strong {
    display: flex;
    align-items: center;
    min-height: 2.75rem;
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-6);
    line-height: 1.25;
  }

  span {
    grid-column: 2;
    color: var(--on-dark-muted);
  }
}

/* Tools */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  gap: var(--space-4);
  margin-top: var(--space-7);
  padding: 0;
  list-style: none;
  counter-reset: tool;
}

.tool-card {
  padding: var(--space-5);
  border-radius: var(--radius-3);
  background-color: var(--cream);
  counter-increment: tool;

  &::before {
    content: counter(tool);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    margin-bottom: var(--space-3);
    border-radius: var(--radius-round);
    background-color: var(--color-navy);
    color: white;
    font-size: var(--font-size--1);
    font-weight: var(--font-weight-7);
  }

  h3 {
    font-size: var(--font-size-0);
    line-height: 1.3;
  }

  p {
    margin-top: var(--space-1);
    font-size: var(--font-size--1);
    line-height: 1.55;
    color: var(--muted);
  }
}

.tools-theory {
  max-width: 48rem;
  margin-top: var(--space-6);
  color: var(--muted);
}

/* Age tips */
.age-box {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--space-7);
  align-items: start;
  margin-top: var(--space-8);
  padding: var(--space-7);
  border-radius: var(--radius-4);
  background-color: var(--color-navy);
  color: white;

  p {
    color: var(--on-dark-muted);
  }

  .eyebrow {
    color: var(--color-light-lime);
  }

  @media (--lg-n-below) {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }

  @media (--md-n-below) {
    padding: var(--space-5);
  }
}

.age-title {
  margin-block: var(--space-2) var(--space-3);
  font-size: var(--font-size-3);
  line-height: 1.2;
}

/* Preview */
.preview {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: var(--space-7);
  align-items: center;
  margin-top: var(--space-8);

  @media (--lg-n-below) {
    grid-template-columns: 1fr;
  }
}

/* Author */
.author {
  display: grid;
  grid-template-columns: minmax(0, 22rem) 1fr;
  gap: var(--space-8);
  align-items: center;

  @media (--md-n-below) {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

.author-photo {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 200px 200px var(--radius-4) var(--radius-4);

  @media (--md-n-below) {
    width: min(100%, 18rem);
    margin-inline: auto;
  }
}

.pill.green {
  color: var(--color-forest-green);
}

.author-name {
  margin-top: var(--space-4);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-5);
  padding: 0;
  list-style: none;

  li {
    padding: 6px 16px;
    border-radius: var(--radius-round);
    background-color: var(--cream);
    font-size: var(--font-size--1);
  }
}

/* FAQ */
.faq {
  width: 100%;
  max-width: 55rem;
  margin-inline: auto;

  .section-title {
    margin-bottom: var(--space-5);
  }
}

/* Final CTA */
.final {
  text-align: center;

  > div {
    max-width: 52rem;
    margin-inline: auto;
  }
}

.final-buy {
  margin-top: var(--space-7);
}

.desatero {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
  max-width: 46rem;
  margin: var(--space-8) auto 0;
  padding: var(--space-6) var(--space-7);
  border-radius: var(--radius-4);
  background-color: var(--color-light-lime);
  color: var(--color-navy);
  text-align: start;

  > div {
    flex: 1 1 16rem;
  }

  @media (--sm-n-below) {
    padding: var(--space-5);
  }
}

.desatero-title {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-7);
  line-height: 1.3;
}

.desatero-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  padding-inline: var(--space-6);
  border-radius: var(--radius-round);
  background-color: var(--color-navy);
  color: white;
  font-size: 1rem;
  font-weight: var(--font-weight-6);
  text-decoration: none;

  &:hover {
    background-color: var(--brand-color-bright);
  }
}
</style>
