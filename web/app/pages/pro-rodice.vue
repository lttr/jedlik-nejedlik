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
      <NuxtLink to="/nadvaha" class="topic-link topic-link--blue">
        Moje dítě má nadváhu/obezitu
      </NuxtLink>
      <NuxtLink to="/prevence" class="topic-link topic-link--lime">
        Téma mě zajímá preventivně
      </NuxtLink>
    </nav>

    <!-- Newsletter Section -->
    <section class="newsletter">
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
  align-items: center;

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

/* Newsletter Section */
.newsletter {
  margin-top: var(--space-8);
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

/* Webinars Section */

/* TODO: Webinars Section
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
*/

/* Courses Section */
/* TODO: Courses Section
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

.p-button {
  font-size: var(--font-size-0);
  padding-inline: var(--space-5);
  height: var(--size-5);
}
*/
</style>
