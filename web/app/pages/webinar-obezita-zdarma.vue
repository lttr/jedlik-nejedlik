<template>
  <PageWrapper class="webinar-page">
    <header class="page-header">
      <p class="badge">Akce zdarma</p>
      <h1>Dětská obezita v otázkách a odpovědích</h1>
      <p class="subtitle">Webinář zdarma - 9. března od 19:00</p>
    </header>

    <section class="info-section p-prose">
      <p>
        Dětská obezita nevzniká přes noc a její řešení není nikdy jen
        o&nbsp;jídle&hellip; V&nbsp;rámci Světového dne obezity otevíráme
        prostor pro vaše rodičovské otázky k&nbsp;tématu dětské nadváhy
        a&nbsp;obezity.
      </p>

      <p>
        Začínáme v&nbsp;19:00 a během jedné hodiny vám budeme odpovídat na vaše
        dotazy.
      </p>

      <p class="note">
        Z&nbsp;webináře nebude pořizován záznam, aby byla zajištěna psychická
        pohoda všech zúčastněných a mohli jste se bez obav ptát na cokoliv, co
        vás k&nbsp;tématu zajímá.
      </p>

      <p>Kapacita: 100 osob</p>

      <p>Odkaz na webinář vám zašleme e-mailem po přihlášení.</p>
    </section>

    <section class="signup-section">
      <h2>Přihlášení na webinář</h2>
      <WebinarSignupForm />
    </section>
  </PageWrapper>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Webinář zdarma - Dětská obezita v otázkách a odpovědích",
  description:
    "Bezplatný webinář pro rodiče dětí s nadváhou a obezitou. 9. března od 19:00. Kapacita 100 osob.",
})
</script>

<style scoped>
.page-header {
  text-align: center;
  padding: var(--space-6) var(--space-4) var(--space-4);
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.badge {
  display: inline-block;
  background: var(--color-light-lime);
  color: var(--color-forest-green);
  font-weight: var(--font-weight-6);
  font-size: var(--font-size--1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-round);
  margin-bottom: var(--space-3);
}

.page-header h1 {
  margin-bottom: var(--space-2);
}

.subtitle {
  font-size: var(--font-size-2);
  color: var(--color-forest-green);
  font-weight: var(--font-weight-5);
  margin: 0;
}

.info-section {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding: var(--space-5) var(--space-4);
}

.note {
  font-style: italic;
  color: var(--text-2);
}

.signup-section {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding: var(--space-4) var(--space-4) var(--space-8);
}

.signup-section h2 {
  text-align: center;
  margin-bottom: var(--space-5);
}
</style>
