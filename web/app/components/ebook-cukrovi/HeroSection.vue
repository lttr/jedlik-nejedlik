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
          <div>
            <blockquote>„{{ DOCTOR_REVIEW.shortQuote }}“</blockquote>
            <figcaption>
              <strong>{{ DOCTOR_REVIEW.name }}</strong
              >, dětská lékařka
            </figcaption>
          </div>
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

  <section class="media-strip p-full-bg" aria-label="Autorku znáte z">
    <div class="media-row">
      <span class="eyebrow">Autorku znáte z</span>
      <ul class="media-list">
        <li v-for="outlet of MEDIA" :key="outlet">{{ outlet }}</li>
      </ul>
    </div>
  </section>

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
import BuyLink from "./BuyLink.vue"
import { COVER_BADGES, DOCTOR_REVIEW, MEDIA } from "./content"
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
  position: relative;
  margin-top: calc(-1 * var(--space-6));
  padding-block: var(--space-8) var(--space-9);
  background-color: var(--cream);
  overflow: hidden;
}

.hero-circle {
  position: absolute;
  top: var(--space-7);
  right: -120px;
  width: 640px;
  aspect-ratio: 1;
  border-radius: var(--radius-round);
  background-color: var(--color-peach);

  @media (--lg-n-below) {
    top: auto;
    right: 50%;
    bottom: var(--space-6);
    width: 420px;
    transform: translateX(50%);
  }
}

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: var(--space-8);
  align-items: center;

  @media (--lg-n-below) {
    grid-template-columns: 1fr;
  }
}

.hero-title {
  margin-block: var(--space-4);
  font-size: clamp(2.4rem, 5.4vw, 4.1rem);
  font-weight: var(--font-weight-7);
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.hero-lead {
  max-width: 36rem;
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
  display: flex;
  align-items: center;
  gap: var(--space-3);
  max-width: 35rem;
  margin: var(--space-6) 0 0;

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

.media-strip {
  padding-block: var(--space-6);
  border-bottom: 1px solid var(--surface-2);
}

.media-row,
.media-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-2) var(--space-7);
}

.media-list {
  padding: 0;
  list-style: none;

  li {
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-7);
    opacity: 0.75;
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
