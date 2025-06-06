<template>
  <PageWrapper class="p-flow">
    <section>
      <p class="p-center intro">
        Stránky vznikají. Informace k individuálnímu poradenství najdete na
        stránkách Zdeňky Trummové
        <NuxtLink to="https://www.okolokuchyne.cz" class="p-heading-3"
          >www.okolokuchyne.cz</NuxtLink
        >
      </p>
    </section>

    <section class="p-stack">
      <h2>Webináře</h2>

      <div class="p-stack">
        <div class="webinar-card">
          <h3>Jídlo na cesty pro děti i dospělé</h3>
          <div class="webinar-details">
            <p><strong>Datum:</strong> 19. června 2025 v 18:30</p>
            <p><strong>Délka:</strong> 90-120 minut</p>
            <p><strong>Cena:</strong> 299 Kč</p>
            <p>
              <strong>Formát:</strong> Online webinář se záznamem pro všechny
              účastníky
            </p>
          </div>
          <p class="webinar-description">
            Naučte se připravovat svačiny na cesty, vyhnout se pastím při výběru
            jídla a vybírat vhodné restaurace. Webinář pokrývá praktické tipy
            pro cestování s dětmi i dospělými.
          </p>
          <NuxtLink
            class="p-button p-button-brand"
            href="https://form.simpleshop.cz/xKQ4W/buy/"
          >
            Koupit webinář
          </NuxtLink>
        </div>

        <div class="webinar-card">
          <h3>A co mám pořád vařit?</h3>
          <div class="webinar-details">
            <p><strong>Datum:</strong> 24. června 2025 v 18:30</p>
            <p><strong>Délka:</strong> 90-120 minut</p>
            <p><strong>Cena:</strong> 299 Kč</p>
            <p>
              <strong>Formát:</strong> Online webinář se záznamem pro všechny
              účastníky
            </p>
          </div>
          <p class="webinar-description">
            Zjednodušte si každodenní vaření, naučte se lépe organizovat kuchyň
            a snižovat plýtvání jídlem. Praktické rady pro rodiče, kteří hledají
            inspiraci pro každodenní menu.
          </p>
          <NuxtLink
            class="p-button p-button-brand"
            href="https://form.simpleshop.cz/KmB6/buy/"
          >
            Koupit webinář
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="p-stack">
      <h2>Kurzy</h2>
      <div class="webinar-card">
        <div class="p-cluster">
          Kurz zdravého (ne)hubnutí v Hradci Králové (odkaz na informace o
          kurzu)
          <NuxtLink
            class="p-button p-button-brand"
            href="https://www.stob.cz/cs/kurz-zdraveho-ne-hubnuti-pro-deti-hradec-kralove-zakladni"
          >
            Koupit
          </NuxtLink>
        </div>
      </div>
    </section>
  </PageWrapper>
</template>

<script lang="ts" setup></script>

<style scoped>
h2 {
  margin-top: var(--space-2);
}

.intro {
  margin-bottom: var(--space-7);
}

.webinar-card {
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.webinar-card h3 {
  margin-bottom: var(--space-3);
}

.webinar-details {
  margin-bottom: var(--space-3);
}

.webinar-details p {
  margin-bottom: var(--space-1);
}

.webinar-description {
  margin-bottom: var(--space-4);
}
</style>
