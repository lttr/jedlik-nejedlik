<template>
  <div class="ebook-page">
    <!-- Hero Section -->
    <section class="hero p-full-bg">
      <div class="hero-content">
        <div class="hero-text">
          <span class="chip">e-kniha</span>
          <h1 class="hero-title">Cukroví s dětmi a v pohodě</h1>
          <p class="hero-subtitle">
            Rodičovský průvodce dlouhodobou pohodou okolo vánočního mlsání.
          </p>
          <p class="hero-benefit">
            58stránkový e-book, který vám pomůže prožít Vánoce bez hádek, stresu
            a zbytečného přejídání — a zároveň podporovat zdravý vztah dítěte k
            jídlu.
          </p>
          <div class="hero-cta">
            <a
              :href="purchaseUrl"
              class="cta-button primary"
              target="_blank"
              rel="noopener"
              >To chci — koupit e-book</a
            >
          </div>
        </div>
        <div class="hero-image">
          <SvgoCukroviOpt class="cookie-svg" aria-hidden="true" />
        </div>
      </div>
    </section>

    <!-- Why Section -->
    <section class="why-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Proč tento e-book vznikl?</h2>
        <p class="why-text">
          Vánoce mohou být krásné i chaotické. Sladké se během svátků často mění
          v boj o hranice, reakce dítěte a naše vlastní očekávání.
        </p>
        <p class="why-conclusion">
          <strong
            >Tento e-book vám pomůže projít obdobím cukroví s klidem a zároveň
            nastavovat hranice, které dítěti dávají jistotu.</strong
          >
        </p>
      </div>
    </section>

    <!-- Contents Section -->
    <section class="contents-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Co uvnitř najdete</h2>
        <div class="contents-grid">
          <div class="contents-column">
            <h3 class="contents-heading">Teoretická část</h3>
            <ul class="contents-list">
              <li>Jak děti reagují na cukroví z pohledu výživy</li>
              <li>Proč Vánoce rozhození režimu ještě zhoršují</li>
              <li>Jak nastavit laskavé a realistické hranice</li>
              <li>Vánoční návštěvy a výživové pasti</li>
              <li>Desatero vánočního mlsání bez výčitek</li>
            </ul>
          </div>
          <div class="contents-column">
            <h3 class="contents-heading">Praktická část</h3>
            <ul class="contents-list">
              <li>Nápadník aktivit při tvorbě cukroví</li>
              <li>Co pomáhá nejmenším během pečení</li>
              <li>První pomoc při zhrouceném pečení</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Preview Section -->
    <section class="preview-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Nahlédněte dovnitř</h2>
        <p class="preview-intro">
          Ukázky z e-booku vám pomohou udělat si představu o obsahu a grafickém
          zpracování.
        </p>
        <div class="preview-grid">
          <button
            v-for="(image, index) in previewImages"
            :key="image.id"
            class="preview-thumbnail"
            @click="openLightbox(index)"
          >
            <NuxtImg
              :src="image.id"
              provider="directus"
              width="300"
              height="424"
              :alt="`Ukázka z e-booku - strana ${index + 1}`"
              loading="lazy"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- Lightbox Dialog -->
    <dialog
      ref="lightboxDialog"
      class="lightbox"
      @click="closeLightboxOnBackdrop"
    >
      <div class="lightbox-content" @click.stop>
        <button
          class="lightbox-close"
          @click="closeLightbox"
          aria-label="Zavřít"
        >
          <Icon name="mdi:close" />
        </button>
        <button
          class="lightbox-nav lightbox-prev"
          @click="prevImage"
          :disabled="currentImageIndex === 0"
          aria-label="Předchozí"
        >
          <Icon name="mdi:chevron-left" />
        </button>
        <div class="lightbox-image-container">
          <NuxtImg
            v-if="currentImage"
            :src="currentImage.id"
            provider="directus"
            width="800"
            :alt="`Ukázka z e-booku - strana ${currentImageIndex + 1}`"
          />
        </div>
        <button
          class="lightbox-nav lightbox-next"
          @click="nextImage"
          :disabled="currentImageIndex === previewImages.length - 1"
          aria-label="Další"
        >
          <Icon name="mdi:chevron-right" />
        </button>
        <div class="lightbox-counter">
          {{ currentImageIndex + 1 }} / {{ previewImages.length }}
        </div>
      </div>
    </dialog>

    <!-- Target Audience Section -->
    <section class="audience-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Pro koho je</h2>
        <div class="audience-cards">
          <div class="audience-card">
            <h3>Pro rodiče miminek (první Vánoce)</h3>
            <p>
              Pomůže vám promyslet rámec kolem sladkého ještě dřív, než ho dítě
              začne testovat.
            </p>
          </div>
          <div class="audience-card">
            <h3>Pro rodiče starších dětí</h3>
            <p>
              Přináší nástroje, jak ustát konflikty, návštěvy i výzvy svátků bez
              výčitek.
            </p>
          </div>
          <div class="audience-card">
            <h3>Pro rodiče dětí s nadváhou</h3>
            <p>
              Podpoří dítě i rodiče díky předvídatelnosti a klidnému vedení
              během svátků.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Co vám přinese?</h2>
        <ul class="benefits-list">
          <li>
            <Icon name="mdi:check-circle" class="benefit-icon" />
            <span>Jasnost, klid a konkrétní postupy</span>
          </li>
          <li>
            <Icon name="mdi:check-circle" class="benefit-icon" />
            <span>Reálné scénáře a řešení</span>
          </li>
          <li>
            <Icon name="mdi:check-circle" class="benefit-icon" />
            <span>Nástroje z oblasti výživy, psychologie i rodičovství</span>
          </li>
        </ul>

        <h3 class="not-title">Co v e-booku nenajdete?</h3>
        <ul class="not-list">
          <li>Že dítě přestane testovat hranice</li>
          <li>Přísné návody nebo zákazy</li>
          <li>Recepty — ty s vámi sdílíme zdarma na sociálních sítích</li>
        </ul>
      </div>
    </section>

    <!-- Author Section -->
    <section class="author-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Kdo e-book vytvořil</h2>
        <div class="author-content">
          <p>
            <strong>Zdeňka Trummová</strong> — pedagog, nutriční poradce,
            studentka nutriční terapie, lektorka zdravého životního stylu, máma
            dvou holčiček, která se opírá o vědecky podložená data a ověřené
            postupy v práci s rodinami — bez strašení a bez nerealistických
            slibů.
          </p>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section p-full-bg">
      <div class="section-content">
        <h2 class="pricing-title">Kolik mě podpora o svátcích bude stát?</h2>
        <div class="price-box">
          <div class="price">249 Kč</div>
          <p class="price-details">58 stran + doživotní aktualizace zdarma</p>
          <a
            :href="purchaseUrl"
            class="cta-button primary large"
            target="_blank"
            rel="noopener"
            >To chci</a
          >
          <p class="price-note">Cena platná do 6. prosince, poté 290 Kč</p>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">FAQ</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3 class="faq-question">Je to i pro rodiče miminek?</h3>
            <p class="faq-answer">Ano, čím lepší základy položíte, tím lépe.</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Je to pro nejedlíky?</h3>
            <p class="faq-answer">
              Ano. V e-booku najdete mnoho tipů, jak vzít děti do kuchyně a
              zažít tam úspěch. Dítě rozšiřuje svůj repertoár potravin i tím, že
              s jídlem pracuje.
            </p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Najdu uvnitř recepty?</h3>
            <p class="faq-answer">
              Ne. Pár tipů najdete u nás na sítích, ale e-book není o receptech.
            </p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Pomůže to, i když máme doma chaos?</h3>
            <p class="faq-answer">
              Ano, e-book je vedený reálnými situacemi rodičů.
            </p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">
              Je e-book pro mě, když jsem úplně vyřízená máma?
            </h3>
            <p class="faq-answer">
              Ano, ALE… V e-booku najdete tipy, jak si přípravy okolo cukroví a
              vánočního mlsání nejdřív dobře nastavit, aby vám během Vánoc
              neutíkala energie oknem. Pokud jste ale silně přetížená, bude pro
              vás e-book zdrojem dalších informací a v případě přetížení je
              možná dobré nekonzumovat žádné informace — byť ty od nás jsou
              opravdu kvalitní.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- References Section -->
    <section class="references-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Reference rodičů</h2>
        <div class="references-list">
          <blockquote class="reference">
            „Poprvé jsme měli Vánoce bez bojů o cukroví."
          </blockquote>
          <blockquote class="reference">
            „Praktické a laskavé tipy, které fungují."
          </blockquote>
          <blockquote class="reference">
            „Díky e-booku máme jasná pravidla, ale bez stresu."
          </blockquote>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta p-full-bg">
      <div class="section-content">
        <a
          :href="purchaseUrl"
          class="cta-button primary large"
          target="_blank"
          rel="noopener"
          >To chci — stáhnout e-book za 249 Kč</a
        >
        <p class="final-note">Cena platná do 6. prosince, poté 290 Kč</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const purchaseUrl = "https://form.simpleshop.cz/gN5Qq/buy/"

useSeoMeta({
  title: "Cukroví s dětmi a v pohodě | E-book",
  description:
    "Praktický e-book pro rodiče, kteří chtějí projít vánočním obdobím bez stresu, přejídání a hádek kolem sladkého.",
})
</script>

<style scoped>
.ebook-page {
  --section-padding: var(--space-8);
}

/* Hero Section */
.hero {
  background-color: var(--color-burgundy-red);
  color: white;
  padding-block: var(--space-8);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-7);
  align-items: center;
}

.chip {
  display: inline-block;
  font-size: var(--font-size--1);
  padding-inline: var(--space-2);
  padding-block: 3px;
  border-radius: var(--radius-default);
  border: var(--border-size-1) solid white;
  margin-bottom: var(--space-3);
}

.hero-title {
  font-size: var(--font-size-6);
  font-weight: var(--font-weight-7);
  line-height: var(--font-lineheight-1);
  margin-bottom: var(--space-3);
}

.hero-subtitle {
  font-size: var(--font-size-2);
  margin-bottom: var(--space-3);
  opacity: 0.95;
}

.hero-benefit {
  font-size: var(--font-size-0);
  max-width: var(--size-content-2);
  margin-bottom: var(--space-5);
  text-wrap: pretty;
}

.hero-cta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.cookie-svg {
  width: 100%;
  max-width: 400px;
  height: auto;
  transform: scale(1.2);
}

/* CTA Buttons */
.cta-button {
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-round);
  font-weight: var(--font-weight-6);
  text-decoration: none;
  text-align: center;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.cta-button.primary {
  background-color: var(--color-light-lime);
  color: var(--color-forest-green);
}

.cta-button.primary:hover {
  background-color: color-mix(in srgb, var(--color-light-lime) 80%, white);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.cta-button.large {
  padding: var(--space-4) var(--space-7);
  font-size: var(--font-size-1);
}

/* Section Common Styles */
.section-content {
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.section-title {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-7);
  text-align: center;
  margin-bottom: var(--space-6);
}

/* Why Section */
.why-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.why-text {
  font-size: var(--font-size-1);
  text-align: center;
  margin-bottom: var(--space-4);
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.why-conclusion {
  font-size: var(--font-size-1);
  text-align: center;
  padding: var(--space-5);
  background-color: var(--color-peach);
  border-radius: var(--radius-3);
}

/* Contents Section */
.contents-section {
  background-color: white;
  padding-block: var(--section-padding);
}

.contents-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.contents-heading {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-4);
  color: var(--color-burgundy-red);
}

.contents-list {
  list-style: none;
  padding: 0;
}

.contents-list li {
  position: relative;
  padding-left: var(--space-5);
  margin-bottom: var(--space-3);
}

.contents-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--color-forest-green);
  font-weight: bold;
}

/* Audience Section */
.audience-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.audience-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.audience-card {
  background-color: white;
  padding: var(--space-5);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-2);
}

.audience-card h3 {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-3);
  color: var(--color-burgundy-red);
}

.audience-card p {
  font-size: var(--font-size-0);
  color: var(--text-color-2);
}

/* Benefits Section */
.benefits-section {
  background-color: white;
  padding-block: var(--section-padding);
}

.benefits-list {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-7);
}

.benefits-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  font-size: var(--font-size-1);
}

.benefit-icon {
  color: var(--color-forest-green);
  font-size: var(--font-size-3);
  flex-shrink: 0;
}

.not-title {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  text-align: center;
  margin-bottom: var(--space-4);
}

.not-list {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
  text-align: center;
}

.not-list li {
  margin-bottom: var(--space-2);
  color: var(--text-color-2);
}

/* Author Section */
.author-section {
  background-color: var(--color-peach);
  padding-block: var(--section-padding);
}

.author-content {
  text-align: center;
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.author-content p {
  font-size: var(--font-size-1);
  margin-bottom: var(--space-4);
}

/* Pricing Section */
.pricing-section {
  background-color: var(--color-burgundy-red);
  color: white;
  padding-block: var(--section-padding);
  text-align: center;
}

.pricing-title {
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-6);
}

.price-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.price {
  font-size: var(--font-size-7);
  font-weight: var(--font-weight-8);
}

.price-details {
  font-size: var(--font-size-1);
  opacity: 0.9;
  margin-bottom: var(--space-3);
}

.price-note {
  font-size: var(--font-size--1);
  opacity: 0.8;
}

/* FAQ Section */
.faq-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.faq-list {
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.faq-item {
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--surface-3);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-2);
}

.faq-answer {
  color: var(--text-color-2);
}

/* References Section */
.references-section {
  background-color: white;
  padding-block: var(--section-padding);
}

.references-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.reference {
  font-size: var(--font-size-1);
  font-style: italic;
  text-align: center;
  padding: var(--space-4);
  margin: 0;
  background-color: var(--surface-1);
  border-radius: var(--radius-3);
  border-left: 4px solid var(--color-burgundy-red);
}

/* Final CTA */
.final-cta {
  background-color: var(--color-burgundy-red);
  color: white;
  padding-block: var(--space-7);
  text-align: center;
}

.final-note {
  margin-top: var(--space-3);
  font-size: var(--font-size--1);
  opacity: 0.8;
}

/* Responsive */
@media (--lg-n-below) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-title {
    font-size: var(--font-size-5);
  }

  .hero-benefit {
    margin-inline: auto;
  }

  .hero-cta {
    align-items: center;
  }

  .hero-image {
    order: -1;
  }

  .cookie-svg {
    max-width: 280px;
    transform: scale(1);
  }

  .contents-grid {
    grid-template-columns: 1fr;
  }

  .audience-cards {
    grid-template-columns: 1fr;
  }
}

@media (--sm-n-below) {
  .ebook-page {
    --section-padding: var(--space-6);
  }

  .hero {
    padding-block: var(--space-6);
  }

  .hero-title {
    font-size: var(--font-size-4);
  }

  .section-title {
    font-size: var(--font-size-3);
  }

  .price {
    font-size: var(--font-size-6);
  }
}
</style>
