<template>
  <PageWrapper class="nadvaha">
    <!-- Page Header -->
    <header class="page-header">
      <h1>Moje dítě má nadváhu</h1>
      <p class="lead">Nezoufejte, jste tu správně.</p>
    </header>

    <!-- Intro Section -->
    <section class="intro-section">
      <div class="intro-content p-prose">
        <p>
          Dětská nadváha i obezita vznikají souhrou mnoha faktorů. Nejde o jedno
          rodičovské rozhodnutí, geny apod. Na vyšší hmotnosti se podílí vždy
          životní styl, rodinné návyky, genetika, individuální predispozice,
          prostředí a mnoho dalších vlivů.
        </p>

        <p class="highlight">
          U nás nesoudíme, u nás se díváme dopředu a pomáháme.
        </p>

        <p>
          Rodiče často přicházejí s obavou, že „něco pokazili", že se na ně
          budeme dívat jako na viníka a nastavíme rodině přísné restrikce.
        </p>

        <p>V Jedlíkovi-nejedlíkovi pracujeme jinak – Rodič je náš partner.</p>

        <ul class="values-list">
          <li>Bez strašení a diet</li>
          <li>Bez srovnávání s ostatními</li>
          <li>Bez tlaku na výkon či vzhled</li>
        </ul>

        <p>
          Soustředíme se na to, co skutečně pomáhá: stabilní návyky, úpravy
          které jsou pro rodinu žitelné a udržitelné a laskavé vedení.
        </p>
      </div>
    </section>

    <!-- Offers Navigation -->
    <nav class="offers-nav">
      <NuxtLink to="/konzultace-deti-obezita" class="offer-link">
        Individuální konzultace
      </NuxtLink>
      <NuxtLink to="/2026-online-kurz-deti" class="offer-link">
        Online kurz pro rodiče dětí s nadváhou a obezitou ve věku 3–7 let
      </NuxtLink>
      <!-- TODO: add link to STOB course -->
      <a
        href="https://www.stob.cz/cs/kurz-zdraveho-ne-hubnuti-pro-deti-hradec-kralove-s-moznosti-cviceni"
        class="offer-link"
        target="_blank"
        rel="noopener"
      >
        Kurz zdravého (ne)hubnutí (naživo)
      </a>
      <NuxtLink to="/webinar-obezita-zdarma" class="offer-link offer-link-free">
        Webinář zdarma - Dětská obezita v otázkách a odpovědích (9.&nbsp;března)
      </NuxtLink>
    </nav>
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

.page-header .lead {
  font-size: var(--font-size-2);
  color: var(--text-2);
  margin: 0;
}

/* Intro Section */
.intro-section {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding: var(--space-5) var(--space-4);
}

.highlight {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-5);
  line-height: var(--font-lineheight-1);
  max-width: 30ch;
  color: var(--color-forest-green);
}

/* Offers Navigation */
.offers-nav {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  padding: var(--space-6) var(--space-4);
  max-width: 50rem;
  margin-inline: auto;

  @media (max-width: 50rem) {
    grid-template-columns: 1fr;
    max-width: 30ch;
  }
}

.offer-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-4);
  text-decoration: none;
  font-weight: var(--font-weight-5);
  font-size: var(--font-size-0);
  text-align: center;
  background: var(--color-pale-blue);
  color: var(--color-navy);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  }
}

.offer-link-free {
  background: var(--color-light-lime);
  color: var(--color-forest-green);
}
</style>
