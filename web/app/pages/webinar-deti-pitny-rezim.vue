<template>
  <PageWrapper class="webinar-page">
    <header class="page-header">
      <p class="badge">Webinář zdarma</p>
      <h1>Děti a&nbsp;pitný režim</h1>
      <p class="subtitle">25.&nbsp;června od&nbsp;19:30 na&nbsp;Zoomu</p>
    </header>

    <section class="info-section p-prose">
      <p>
        Získejte <strong>zdarma</strong> odborné informace, praktické tipy a&nbsp;větší klid kolem
        tématu pitného režimu u&nbsp;dětí.
      </p>

      <p>Blíží se léto. A&nbsp;s&nbsp;ním i&nbsp;věta: &bdquo;Skoro vůbec nepije.&ldquo;</p>

      <p>V&nbsp;teplých dnech začíná mnoho rodičů řešit:</p>
      <ul>
        <li>moje dítě odmítá vodu,</li>
        <li>pije jen džusy nebo sladké,</li>
        <li>celý den mu musím pití připomínat,</li>
        <li>mám strach, že bude dehydratované,</li>
        <li>a&nbsp;vlastně už nevím, kdy je to ještě normální.</li>
      </ul>

      <p>
        Na tomto webináři se podíváme na pitný režim dětí nejen z&nbsp;pohledu výživy, ale
        i&nbsp;návyků, motivace a&nbsp;výchovy.
      </p>

      <p>
        Nečekejte jen rady typu &bdquo;dejte do vody ovoce / kupte různá brčka,
        lahvičky&ldquo;&hellip;
      </p>

      <p>Budeme mluvit také o&nbsp;tom:</p>
      <ul>
        <li>proč některé děti pijí málo,</li>
        <li>jestli máme u&nbsp;kojených dětí dbát na pitný režim,</li>
        <li>jak vznikají návyky,</li>
        <li>jak podporovat pití bez tlaku,</li>
        <li>a&nbsp;kdy už kolem pitného režimu vzniká nefunkční stres.</li>
      </ul>

      <p>
        Informace podáme prakticky, srozumitelně a&nbsp;s&nbsp;mateřskými zkušenostmi za zády,
        přitom odborně podložené.
      </p>
    </section>

    <!-- Lecturers -->
    <section class="lecturers-section">
      <h2 class="section-title">Webinářem vás provedou</h2>
      <div class="lecturers-grid">
        <figure class="lecturer">
          <ProfileImg v-if="zdenkaPhoto" :image="zdenkaPhoto" />
          <figcaption>
            <p class="p-heading-4">Zdeňka Trummová</p>
            <p>pedagog a&nbsp;studentka nutriční terapie</p>
          </figcaption>
        </figure>
        <figure class="lecturer">
          <ProfileImg v-if="alenaPhoto" :image="alenaPhoto" />
          <figcaption>
            <p class="p-heading-4">Alena Boukalová</p>
            <p>nutriční terapeutka</p>
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="signup-section">
      <h2>Přihlášení na webinář</h2>
      <p class="signup-note">Přihlašujte se do&nbsp;24.&nbsp;června. Odkaz vám zašleme e-mailem.</p>
      <WebinarSignupForm
        webinar-id="2026-06-deti-pitny-rezim"
        success-message="Děkujeme za přihlášení! Těšíme se na vás 25. června v 19:30."
      />
    </section>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: zdenkaPhoto } = await useDirectusImage("a64de3ab-044d-46c7-9e4c-64f3854e93d0")
const { data: alenaPhoto } = await useDirectusImage("588336e3-2a93-4bbd-b40c-aa8e3fa0f25a")

useSeoMeta({
  title: "Webinář zdarma – Děti a pitný režim",
  description:
    "Bezplatný webinář pro rodiče o pitném režimu dětí. 25. června od 19:30 na Zoomu. Přihlášení do 24. června.",
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

.lecturers-section {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding: var(--space-4) var(--space-4) var(--space-6);
}

.section-title {
  text-align: center;
  margin-bottom: var(--space-5);
}

.lecturers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);

  @media (--sm-n-below) {
    grid-template-columns: 1fr;
  }
}

.lecturer {
  margin: 0;
  text-align: center;
}

.lecturer figcaption p {
  margin: var(--space-2) 0 0;
}

.lecturer figcaption p:last-child {
  color: var(--text-2);
}

.signup-section {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding: var(--space-4) var(--space-4) var(--space-8);
}

.signup-section h2 {
  text-align: center;
  margin-bottom: var(--space-2);
}

.signup-note {
  text-align: center;
  color: var(--text-2);
  margin-bottom: var(--space-5);
}
</style>
