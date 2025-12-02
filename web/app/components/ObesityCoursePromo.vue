<template>
  <div class="obesity-course-promo">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
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
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
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

/* Course Promo Section */
.course-promo {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding-block: var(--space-5);
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
</style>
