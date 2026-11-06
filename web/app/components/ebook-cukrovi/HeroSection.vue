<template>
  <section class="hero p-full-bg">
    <div class="hero-circle" aria-hidden="true"></div>
    <div class="hero-grid">
      <div>
        <span class="pill">E-book pro rodiče · Vánoce 2026</span>
        <h1 class="hero-title">Vánoce bez bitev o&nbsp;cukroví. I&nbsp;u&nbsp;babičky.</h1>
        <p class="lead hero-lead">
          Průvodce od nutriční poradkyně: jak dát dětem sladké, neztratit nervy a&nbsp;budovat
          zdravý vztah k&nbsp;jídlu. Pro děti od miminek po školáky.
        </p>
        <div ref="heroCta" class="hero-cta">
          <BuyLink size="big" />
          <span class="hero-cta-note">
            <strong>PDF hned do e-mailu</strong><br />
            čtení v&nbsp;mobilu i&nbsp;tisk
          </span>
        </div>
        <figure class="hero-quote">
          <img
            :src="DOCTOR_REVIEW.image"
            alt=""
            class="avatar"
            width="48"
            height="48"
            loading="lazy"
          />
          <blockquote>„{{ DOCTOR_REVIEW.shortQuote }}“</blockquote>
          <figcaption>
            <strong>{{ DOCTOR_REVIEW.name }}</strong
            >, dětská lékařka
          </figcaption>
        </figure>
      </div>
      <div class="hero-cover">
        <EbookCover />
        <ul class="badges">
          <li v-for="badge of COVER_BADGES" :key="badge">{{ badge }}</li>
        </ul>
      </div>
    </div>
  </section>

  <MediaStrip label="Autorku znáte z" />

  <Transition name="slide-up">
    <div v-show="showStickyBar" class="sticky-bar">
      <div class="sticky-text">
        <strong>Cukroví s&nbsp;dětmi</strong>
        <span>PDF hned do e-mailu</span>
      </div>
      <BuyLink size="small" class="sticky-buy" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import MediaStrip from "../MediaStrip.vue"
import BuyLink from "./BuyLink.vue"
import { COVER_BADGES, DOCTOR_REVIEW } from "./content"
import EbookCover from "./EbookCover.vue"

// Shown once the hero CTA has scrolled up out of view; CSS keeps it mobile-only.
const heroCta = useTemplateRef<HTMLElement>("heroCta")
const showStickyBar = ref(false)
useIntersectionObserver(heroCta, ([entry]) => {
  showStickyBar.value =
    entry !== undefined && !entry.isIntersecting && entry.boundingClientRect.top < 0
})
</script>

<style scoped>
.hero {
  margin-top: calc(-1 * var(--space-6));
  padding-block: var(--space-8) var(--space-9);
  background-color: var(--cream);
}

.hero-circle {
  top: var(--space-7);
  right: -120px;
  width: 640px;
  background-color: var(--color-peach);

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
  align-items: center;
  gap: var(--space-4) var(--space-5);
  margin-top: var(--space-6);
}

.hero-cta-note {
  font-size: var(--font-size--1);
  line-height: 1.4;
  color: var(--muted);

  strong {
    color: var(--color-navy);
  }
}

.hero-quote {
  display: grid;
  grid-template-columns: auto 1fr;
  align-content: center;
  column-gap: var(--space-3);
  max-width: 35rem;
  margin: var(--space-6) 0 0;

  .avatar {
    grid-row: span 2;
    align-self: center;
  }

  blockquote {
    margin: 0;
    font-style: italic;
    line-height: 1.45;
  }

  figcaption {
    margin-top: 2px;
    font-size: var(--font-size--1);
    color: var(--muted);

    strong {
      color: var(--color-navy);
    }
  }
}

.hero-cover {
  width: min(100%, 22rem);
  margin-inline: auto;

  @media (--lg-n-below) {
    width: min(75%, 18rem);
  }
}

.badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
  padding: 0;
  list-style: none;

  li {
    padding: 5px 14px;
    border-radius: var(--radius-round);
    background: white;
    font-size: var(--font-size--1);
    font-weight: var(--font-weight-6);
  }
}

.sticky-bar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 60;
  display: none;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  padding-bottom: max(var(--space-2), env(safe-area-inset-bottom));
  background: white;
  box-shadow: 0 -8px 24px rgb(10 26 87 / 14%);

  @media (--md-n-below) {
    display: flex;
  }
}

.sticky-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;

  white-space: nowrap;

  span {
    font-size: var(--font-size--1);
    color: var(--muted);
  }

  /* No room beside the button: the button alone fills the bar. */
  @media (width < 420px) {
    display: none;
  }
}

.sticky-buy {
  @media (width < 420px) {
    flex: 1;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
