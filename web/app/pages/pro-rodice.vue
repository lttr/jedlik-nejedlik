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

      <div class="webinars-content p-stack">
        <div class="webinar-card p-flow">
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
          <div class="webinar-description p-prose">
            <p>
              Jezdíte rádi v létě na výlety? Ať už se jedná o krátký výlet z
              domu nebo dvoutýdenní dovolenou, možná taky řešíte, co s sebou na
              cesty k jídlu. Přihlašte na webinář a dozvíte se spoustu
              praktických tipů, které v létě určitě využijete!
            </p>
            <p><strong>Co se ve společném čase dozvíte?</strong></p>
            <ul>
              <li>že svačinkování není věda</li>
              <li>
                jak z výletu vytěžit maximum, ať už si nesu svačinku v batohu
                nebo si ji koupím cestou
              </li>
              <li>čemu se v rámci svačinek vyhnout a proč</li>
              <li>
                proč neodměňovat děti ani sebe na výletě jídlem a co může být
                lepší odměna
              </li>
              <li>10 nejčastějších jídelních pastí výletníka</li>
              <li>praktické rady jak na svačinky</li>
              <li>jak si vybrat v restauraci</li>
              <li>a samozřejmě i RECEPTY! svačinky na výlety které zasytí</li>
            </ul>
          </div>
          <NuxtLink
            class="p-button p-button-brand"
            href="https://form.simpleshop.cz/xKQ4W/buy/"
          >
            Koupit webinář
          </NuxtLink>
        </div>

        <div class="webinar-card p-flow">
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
          <div class="webinar-description p-prose">
            <p>
              Otázka, kterou občas řekne každá máma. Svačinky, polívčičky,
              obědy, večeře… Nevíte, co pořád vařit, přitom máte doma mnoho
              kuchařek, plnou lednici jídla a ještě ta hromada inspirace na
              internetu? Nebo máte naopak stále prázdnou spíž a už vás nebaví
              jíst jen chleba?
            </p>
            <p><strong>Po webináři budete vědět:</strong></p>
            <ul>
              <li>jak si usnadnit každodenní kolotoč okolo kuchyně</li>
              <li>jaké suroviny mít vždy doma</li>
              <li>jak neplýtvat jídlem a poradit si se zbytky</li>
              <li>
                jak přemýšlet nad vařením, ať už jsem nebo nejsem plánovací typ
              </li>
              <li>a hlavně – JAK SE NEUVAŘIT V KUCHYNI</li>
            </ul>
          </div>
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
        <div class="p-stack">
          <p>
            Kurz zdravého (ne)hubnutí v Hradci Králové (odkaz na informace o
            kurzu)
          </p>
          <p>
            <NuxtLink
              class="p-button p-button-brand"
              href="https://www.stob.cz/cs/kurz-zdraveho-ne-hubnuti-pro-deti-hradec-kralove-zakladni"
            >
              Koupit
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </PageWrapper>
</template>

<script lang="ts" setup></script>

<style scoped>
section {
  margin-block: var(--space-6);
}

h2 {
  margin-top: var(--space-2);
}

.intro {
  margin-bottom: var(--space-7);
}

.webinars-content {
  --stack-space: var(--space-7);
}

.p-button {
  font-size: var(--font-size-0);
  padding-inline: var(--space-5);
  height: var(--size-5);
}
</style>
