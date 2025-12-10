<template>
  <div class="ebook-page">
    <!-- Hero Section -->
    <section class="hero p-full-bg">
      <div class="hero-content">
        <span class="chip">e-kniha</span>
        <h1 class="hero-title">Cukroví s dětmi a v pohodě</h1>
        <p class="hero-subtitle">
          Rodičovský průvodce dlouhodobou pohodou okolo vánočního mlsání.
        </p>
        <p class="hero-benefit">
          Pomůžeme vám projít obdobím vánočního mlsání s klidem, bez výčitek a
          hádek okolo cukroví. I na návštěvách!
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
        <p class="preview-intro">Podívejte se na několik ukázek z e-booku.</p>
        <div class="preview-grid">
          <div
            v-for="(image, index) of previewImages"
            :key="image.id"
            class="preview-thumbnail"
            role="button"
            tabindex="0"
            @click="openLightbox(index)"
            @keydown.enter="openLightbox(index)"
            @keydown.space.prevent="openLightbox(index)"
          >
            <NuxtImg
              :src="image.id"
              provider="directus"
              width="200"
              height="283"
              :alt="`Ukázka z e-booku - strana ${index + 1}`"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox Dialog -->
    <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
    <dialog
      ref="lightboxDialog"
      class="lightbox"
      @click="closeLightboxOnBackdrop"
    >
      <div class="lightbox-content" @click.stop>
        <button
          class="lightbox-close"
          aria-label="Zavřít"
          @click="closeLightbox"
        >
          <Icon name="mdi:close" />
        </button>
        <button
          class="lightbox-nav lightbox-prev"
          :disabled="currentImageIndex === 0"
          aria-label="Předchozí"
          @click="prevImage"
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
          :disabled="currentImageIndex === previewImages.length - 1"
          aria-label="Další"
          @click="nextImage"
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
          <div class="price">290 Kč</div>
          <p class="price-details">58 stran + budoucí aktualizace zdarma</p>
          <a
            :href="purchaseUrl"
            class="cta-button primary large"
            target="_blank"
            rel="noopener"
            >To chci</a
          >
          <p class="price-note">Ke koupi do 22. 12. 2025</p>
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

    <!-- Testimonials Section -->
    <section class="testimonials-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Reference rodičů</h2>
        <div class="testimonials-list">
          <div
            v-for="testimonial of testimonials"
            :key="testimonial.name"
            class="testimonial-card"
          >
            <blockquote class="testimonial-quote">
              {{ testimonial.quote }}
            </blockquote>
            <div class="testimonial-author">
              <img
                :src="testimonial.image"
                :alt="testimonial.name"
                class="testimonial-avatar"
                width="80"
                height="80"
                loading="lazy"
              />
              <div class="testimonial-author-info">
                <strong>{{ testimonial.name }}</strong>
                <span>{{ testimonial.role }}</span>
              </div>
            </div>
          </div>
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
          >To chci — stáhnout e-book za 290 Kč</a
        >
        <p class="final-note">Ke koupi do 22. 12. 2025</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const purchaseUrl = "https://form.simpleshop.cz/gN5Qq/buy/"

const previewImages = [
  { id: "7677b758-7907-4b7b-a7e2-5f121ed3abbc" },
  { id: "1c865708-d38d-420f-8c65-33bc6f91f60a" },
  { id: "92a7e957-0b44-4db3-ade4-19f68a8db6d9" },
]

const testimonials = [
  {
    name: "MUDr. Lenka Veselá",
    role: "Dětská lékařka",
    quote:
      "E-book je napsaný s velkým respektem jak k rodičům, tak k dětem. Nabízí jemné, ale praktické vedení, jak prožít období Vánoc i dalších oslav s větším klidem, bez zbytečného stresu a s důrazem na posilování zdravého vztahu dítěte k jídlu. Oceňuji, že nesklouzává k žádným extrémům – místo toho předkládá různé reálné a rodičovsky proveditelné přístupy, které mohou pomoci vytvořit doma příjemnější atmosféru. 🎄\n\nVelmi užitečné jsou i tipy na společné pečení vánočního cukroví: jak si ho s dětmi užít, nezbláznit se z nepořádku a zároveň podpořit jejich přirozenou zvědavost. Autorka také nabízí praktické rady, jak zvládnout návštěvy a rodinná setkání, kde bývá jídla ‚až až', a přesto si uchovat pohodu.\n\nHlavním poselstvím e-booku je, že budování zdravého vztahu dítěte k jídlu je proces – někdy náročný, ale rozhodně nemusí být raketovou vědou. Stačí drobné, soucitné kroky, které se postupně skládají v dlouhodobý efekt.\n\nE-book doporučuji všem rodičům, kteří se o vztah svých dětí k jídlu zajímají a hledají inspiraci, jak na něm citlivě pracovat. Přečetla jsem ho jedním dechem!",
    image: "/images/testimonials/lenka.webp",
  },
  {
    name: "Alena Rejfková",
    role: "Speciální pedagog a průvodkyně ve školce, máma osmileté slečny a pětileťáka",
    quote:
      "E-book od Zdeňky je nabitý informacemi, napsáno polopaticky i pro laika. Laskavá forma a plno praktických tipů. Děkuji a moc doporučuji.",
    image: "/images/testimonials/alena.webp",
  },
  {
    name: "Andrea Slavíková",
    role: "Maminka Máti 4,5 let a pěti měsíční Madlenky",
    quote:
      "E-book jsem si zakoupila před synovými prvními Vánoci (tedy těmi opravdovými, když mu bylo rok a půl). Neměla jsem úplně ujasněné, jak přistoupit k celému systému koloběhu cukru a čokolád. Díky e-booku jsem získala představu, co a jak můžu udělat, abych se cítila dobře já i syn. Teď, když jsem se ke čtení vrátila (synovi je 4,5), tak i velmi oceňuji kroky, jak prožít návštěvy u rodiny a známých.",
    image: "/images/testimonials/andrea.webp",
  },
  {
    name: "Kateřina Zavřelová",
    role: "Maminka třech malých indiánek",
    quote:
      "Vlastně mě (příjemně) překvapilo, že jsem po přečtení zjistila, že to není tak docela o cukroví, jako spíš o celkovém přístupu k jídlu i k dětem. A přestože doma v tomto nejsme na začátku, našla jsem si tam spoustu tipů, které jsem do dalšího vánočního období už zapojila. Manžel si z dětství nese špatnou zkušenost se zdravým cukrovím, které mu vůbec nechutnalo, a tak hledáme cesty, jak mít vánoční stůl příjemný pro všechny.",
    image: "/images/testimonials/katerina.webp",
  },
]

const lightboxDialog = ref<HTMLDialogElement | null>(null)
const currentImageIndex = ref(0)

const currentImage = computed(() => previewImages[currentImageIndex.value])

function openLightbox(index: number) {
  currentImageIndex.value = index
  lightboxDialog.value?.showModal()
}

function closeLightbox() {
  lightboxDialog.value?.close()
}

function closeLightboxOnBackdrop(event: MouseEvent) {
  if (event.target === lightboxDialog.value) {
    closeLightbox()
  }
}

function nextImage() {
  if (currentImageIndex.value < previewImages.length - 1) {
    currentImageIndex.value++
  }
}

function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (!lightboxDialog.value?.open) {
      return
    }
    if (e.key === "ArrowRight") {
      nextImage()
    }
    if (e.key === "ArrowLeft") {
      prevImage()
    }
    if (e.key === "Escape") {
      closeLightbox()
    }
  }
  window.addEventListener("keydown", handleKeydown)
  onUnmounted(() => window.removeEventListener("keydown", handleKeydown))
})

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
  background-color: white;
  padding-block: var(--space-8);
  margin-top: calc(-1 * var(--space-6));
}

.hero-content {
  max-width: var(--size-content-3);
  margin-inline: auto;
  text-align: center;
}

.chip {
  display: inline-block;
  font-size: var(--font-size--1);
  padding-inline: var(--space-2);
  padding-block: 3px;
  border-radius: var(--radius-default);
  border: var(--border-size-1) solid var(--color-burgundy-red);
  color: var(--color-burgundy-red);
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
}

.hero-benefit {
  font-size: var(--font-size-0);
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-5);
  text-wrap: pretty;
}

.hero-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
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

/* Testimonials Section */
.testimonials-section {
  background-color: white;
  padding-block: var(--section-padding);
}

.testimonials-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.testimonial-card {
  position: relative;
  padding: var(--space-6);
  background-color: var(--color-peach);
  border-radius: var(--radius-3);
}

.testimonial-avatar {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-round);
  object-fit: cover;
  border: 3px solid white;
  flex-shrink: 0;
}

.testimonial-quote {
  font-size: var(--font-size-0);
  color: var(--text-color-1);
  margin: 0 0 var(--space-5);
  line-height: var(--font-lineheight-3);
  white-space: pre-line;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.testimonial-author-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.testimonial-author strong {
  font-size: var(--font-size-0);
  color: var(--text-color-1);
}

.testimonial-author span {
  font-size: var(--font-size--1);
  color: var(--text-color-2);
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
  .hero-title {
    font-size: var(--font-size-5);
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

  .preview-grid {
    gap: var(--space-3);
  }

  .preview-thumbnail {
    width: 140px;
  }

  .testimonial-card {
    padding: var(--space-5);
  }

  .testimonial-quote {
    font-size: var(--font-size-0);
  }

  .testimonial-author {
    flex-direction: column;
    text-align: center;
  }
}

/* Preview Section */
.preview-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.preview-intro {
  text-align: center;
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-6);
  color: var(--text-color-2);
}

.preview-grid {
  display: flex;
  justify-content: center;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.preview-thumbnail {
  display: block;
  width: 220px;
  aspect-ratio: 1240 / 1753;
  padding: 0;
  border: none;
  background: white;
  cursor: pointer;
  border-radius: var(--radius-2);
  overflow: hidden;
  box-shadow: var(--shadow-3);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.preview-thumbnail:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-5);
}

.preview-thumbnail:focus-visible {
  outline: 2px solid var(--color-burgundy-red);
  outline-offset: 2px;
}

.preview-thumbnail :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Lightbox */
.lightbox {
  border: none;
  border-radius: 0;
  background: transparent;
  max-width: 100vw;
  max-height: 100vh;
  padding: 0;
  margin: auto;
}

.lightbox::backdrop {
  background: rgb(255 255 255 / 80%);
  backdrop-filter: blur(8px);
}

.lightbox-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-4);
  position: relative;
}

.lightbox-image-container {
  max-width: min(800px, 90vw);
  max-height: 85vh;
}

.lightbox-image-container :deep(img) {
  display: block;
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
}

.lightbox-close {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 44px;
  height: 44px;
  border: none;
  background: var(--surface-1);
  border-radius: var(--radius-round);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-3);
  color: var(--text-color-1);
  transition: background 0.15s ease;
  box-shadow: var(--shadow-2);
}

.lightbox-close:hover {
  background: white;
}

.lightbox-nav {
  width: 48px;
  height: 48px;
  border: none;
  background: var(--surface-1);
  border-radius: var(--radius-round);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-4);
  color: var(--text-color-1);
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
  flex-shrink: 0;
  box-shadow: var(--shadow-2);
}

.lightbox-nav:hover:not(:disabled) {
  background: white;
}

.lightbox-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lightbox-close:focus-visible,
.lightbox-nav:focus-visible {
  outline: 2px solid var(--color-burgundy-red);
  outline-offset: 2px;
}

.lightbox-counter {
  position: absolute;
  bottom: var(--space-2);
  left: 50%;
  transform: translateX(-50%);
  color: var(--text-color-2);
  font-size: var(--font-size--1);
  background: var(--surface-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-round);
  box-shadow: var(--shadow-2);
}

@media (--sm-n-below) {
  .lightbox-nav {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-2);
  }

  .lightbox-content {
    gap: var(--space-2);
    padding: var(--space-2);
  }
}
</style>
