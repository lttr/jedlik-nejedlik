<template>
  <PageWrapper class="pro-rodice">
    <!-- Page Header -->
    <header class="page-header">
      <h1>Pro rodiče</h1>
      <p>Pomáháme rodičům najít cestu k vyváženému vztahu dětí k jídlu</p>
    </header>

    <!-- Navigation Links Section -->
    <nav class="topic-nav">
      <NuxtLink to="/nejedlik" class="topic-link topic-link--star">
        Máte doma nejedlíka
      </NuxtLink>
      <NuxtLink
        to="/konzultace-deti-obezita"
        class="topic-link topic-link--blue"
      >
        Moje dítě má nadváhu/obezitu
      </NuxtLink>
      <NuxtLink to="/prevence" class="topic-link topic-link--lime">
        Téma mě zajímá preventivně
      </NuxtLink>
    </nav>

    <!-- Current Offers Section -->
    <section class="current-offers">
      <h2 class="section-title">Aktuálně nabízíme</h2>
      <HomepageChristmasCookieSection />
    </section>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <span class="hero-badge">Připravujeme</span>
        <h1>Pomozte svému dítěti znovu najít rovnováhu</h1>
        <p class="hero-subtitle">
          Online kurz pro rodiče dětí s nadváhou a obezitou ve věku 3–7 let
        </p>
      </div>
    </section>

    <!-- Course Promo Section -->
    <section class="course-promo">
      <div class="course-content p-prose">
        <p class="lead">
          Máte pocit, že se situace doma kolem jídla vymyká z rukou?
        </p>
        <p>
          Nadváha u dětí nebolí hned, ale ovlivňuje pohodu, sebevědomí i
          rodinnou atmosféru. Mnoho rodičů cítí nejistotu, co dělat jako první –
          jak dítě podpořit, aniž by mu ublížili přísností, tlakem nebo „diety".
        </p>
      </div>

      <div class="benefits-card">
        <h2>Co vám kurz přinese?</h2>
        <ul class="benefits-list">
          <li>
            <Icon name="uil:check-circle" class="benefit-icon" />
            <span>Bez restrikcí, zákazů a pocitu selhání</span>
          </li>
          <li>
            <Icon name="uil:check-circle" class="benefit-icon" />
            <span
              >Podpora odborníků na výživu, psychologii a práci s dětmi</span
            >
          </li>
          <li>
            <Icon name="uil:check-circle" class="benefit-icon" />
            <span>Praktické návody, které zvládne každá rodina</span>
          </li>
          <li>
            <Icon name="uil:check-circle" class="benefit-icon" />
            <span>Respekt k emocím dítěte i rodiče</span>
          </li>
          <li>
            <Icon name="uil:check-circle" class="benefit-icon" />
            <span>Příklady z praxe, abyste v tom nebyli sami</span>
          </li>
        </ul>
      </div>

      <div class="cta-section">
        <h2>Chcete vědět, až se kurz otevře?</h2>
        <p>
          Zanechte svůj e-mail a dostanete informaci mezi prvními. Počet míst
          bude omezený, aby byla zachována individuální podpora.
        </p>
        <p class="planned-start">
          <Icon name="uil:calendar-alt" />
          <span>Plánovaný start:</span>
          <span><strong>27. ledna 2026</strong></span>
        </p>
        <WaitlistObesityCourseForm />
        <p class="cta-note">
          Připojte se na nezávaznou čekací listinu – teď je nejjednodušší krok,
          který pro budoucnost svého dítěte můžete udělat.
        </p>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter-section">
      <NewsletterForm />
    </section>

    <!-- TODO: Webinars Section
    <section class="webinars-section">
      <h2 class="section-title">Webináře</h2>
      <p class="section-intro">
        Pořádáme online webináře na témata kolem dětského jídla a vaření.
        Sledujte nás na sociálních sítích, ať vám neunikne další termín.
      </p>

      <div class="webinars-grid">
        <article class="webinar-card">
          <h3>Jídlo na cesty pro děti i dospělé</h3>
          <p>
            Praktické tipy, co s sebou na výlety k jídlu – od svačinek v batohu
            po výběr v restauraci.
          </p>
        </article>

        <article class="webinar-card">
          <h3>A co mám pořád vařit?</h3>
          <p>
            Jak si usnadnit každodenní kolotoč okolo kuchyně, jaké suroviny mít
            vždy doma a jak se neuvařit.
          </p>
        </article>
      </div>
    </section>
    -->

    <!-- TODO: Courses Section
    <section class="courses-section">
      <h2 class="section-title">Kurzy</h2>
      <article class="course-card">
        <div class="course-card-content">
          <div>
            <h3>Kurz zdravého (ne)hubnutí</h3>
            <p>Prezenční kurz v Hradci Králové pro děti a jejich rodiče</p>
          </div>
        </div>
        <NuxtLink
          class="p-button p-button-brand"
          href="https://www.stob.cz/cs/kurz-zdraveho-ne-hubnuti-pro-deti-hradec-kralove-zakladni"
        >
          Více informací
        </NuxtLink>
      </article>
    </section>
    -->
  </PageWrapper>
</template>

<script lang="ts" setup></script>

<style scoped>
/* Page Header */
.page-header {
  text-align: center;
  padding: var(--space-6) var(--space-4) var(--space-4);
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.page-header h1 {
  margin-bottom: var(--space-2);
}

.page-header p {
  color: var(--text-2);
  margin: 0;
}

/* Topic Navigation */
.topic-nav {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-4);
  justify-content: center;

  @media (max-width: 50rem) {
    flex-direction: column;
  }
}

.topic-link {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 20ch;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-4);
  text-decoration: none;
  font-weight: var(--font-weight-5);
  font-size: var(--font-size-0);
  text-align: center;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  }
}

.topic-link--star {
  background: var(--color-star);
  color: var(--color-navy);
}

.topic-link--blue {
  background: var(--color-pale-blue);
  color: var(--color-navy);
}

.topic-link--lime {
  background: var(--color-light-lime);
  color: var(--color-forest-green);
}

/* Current Offers Section */
.current-offers {
  padding-block: var(--space-6);
}

.current-offers .section-title {
  margin-bottom: var(--space-4);
}

/* Hero Section */
.hero {
  background: transparent;
  padding: var(--space-7) var(--space-4);
  text-align: center;

  @media (--md-n-above) {
    padding: var(--space-5) var(--space-6);
  }
}

.hero-content {
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.hero-badge {
  display: inline-block;
  background: transparent;
  color: var(--brand-color);
  padding: 3px var(--space-2);
  border-radius: var(--radius-default);
  border: var(--border-size-1) solid var(--brand-color);
  font-size: var(--font-size--1);
  margin-bottom: var(--space-4);
}

.hero h1 {
  font-size: 2rem;
  line-height: var(--font-lineheight-1);
  margin-bottom: var(--space-3);
  color: var(--brand-color);

  @media (--md-n-above) {
    font-size: 3rem;
  }
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--text-2);
  margin: 0;
  max-width: 40ch;
  margin-inline: auto;
}

.section-intro {
  text-align: center;
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-6);
  color: var(--text-2);
}

/* Course Promo Section */
.course-promo {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding-block: var(--space-8);
}

.course-content {
  text-align: center;
  margin-bottom: var(--space-6);
}

.course-content .lead {
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  color: var(--brand-color);
  margin-bottom: var(--space-3);
}

/* Benefits Card */
.benefits-card {
  background: var(--color-peach);
  padding: var(--space-6);
  border-radius: var(--radius-3);
  margin-bottom: var(--space-6);
}

.benefits-card h2 {
  text-align: center;
  margin-bottom: var(--space-4);
  font-size: var(--font-size-3);
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-3);
}

.benefits-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.benefit-icon {
  color: var(--color-forest-green);
  flex-shrink: 0;
  font-size: var(--font-size-3);
}

/* CTA Section */
.cta-section {
  text-align: center;
  padding: var(--space-6);
  background: var(--surface-1);
  border-radius: var(--radius-3);
  border: 1px solid var(--surface-3);
}

.cta-section h2 {
  margin-bottom: var(--space-2);
  font-size: var(--font-size-3);
}

.cta-section p {
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.planned-start {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: var(--color-light-lime);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-round);
  margin-block: var(--space-4);
  font-size: var(--font-size-1);
  flex-wrap: wrap;
}

.cta-note {
  font-style: italic;
  color: var(--text-2);
  font-size: var(--font-size-0);
  margin-top: var(--space-4);
  margin-bottom: 0;
}

/* Newsletter Section */
.newsletter-section {
  padding-block: var(--space-8);
  max-width: var(--size-content-3);
  margin-inline: auto;
}

/* Section Titles */
.section-title {
  font-size: var(--font-size-4);
  text-align: center;
  margin-bottom: var(--space-6);
  position: relative;
}

.section-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 4px;
  background: var(--color-orange-soda);
  margin: var(--space-2) auto 0;
  border-radius: var(--radius-round);
}

/* Webinars Section */
.webinars-section {
  padding-block: var(--space-8);
  background: transparent;
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.webinars-grid {
  display: grid;
  gap: var(--space-5);
  max-width: var(--size-content-3);
  margin-inline: auto;

  @media (--md-n-above) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.webinar-card {
  padding: var(--space-5);
  background: var(--color-peach);
  border-radius: var(--radius-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.webinar-card h3 {
  margin: 0;
  font-size: var(--font-size-2);
  color: var(--brand-color);
}

.webinar-card p {
  margin: 0;
  color: var(--text-2);
}

.webinar-card .p-button {
  align-self: flex-start;
}

/* Courses Section */
.courses-section {
  padding-block: var(--space-8);
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.course-card {
  background: linear-gradient(
    135deg,
    var(--color-pale-blue) 0%,
    var(--color-dull-blue) 100%
  );
  padding: var(--space-5);
  border-radius: var(--radius-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: flex-start;

  @media (--md-n-above) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.course-card-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.course-card h3 {
  margin: 0 0 var(--space-1);
  font-size: var(--font-size-2);
}

.course-card p {
  margin: 0;
  color: var(--text-2);
}

/* Button overrides */
.p-button {
  font-size: var(--font-size-0);
  padding-inline: var(--space-5);
  height: var(--size-5);
}
</style>
