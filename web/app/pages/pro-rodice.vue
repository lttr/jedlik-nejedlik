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
      <h2>Kurzy a webináře</h2>

      <div class="p-stack">
        <div class="p-cluster">
          Webinář Jídlo na cesty pro děti a dospělé (odkaz na formulář)
          <NuxtLink class="p-button p-button-brand" href="https://form.simpleshop.cz/xKQ4W/buy/">
            Koupit
          </NuxtLink>
        </div>

        <div class="p-cluster">
          Webinář Co mám pořád vařit pro děti a dospělé (odkaz na formulář)
          <NuxtLink class="p-button p-button-brand" href="https://form.simpleshop.cz/KmB6/buy/">
            Koupit
          </NuxtLink>
        </div>

        <div class="p-cluster">
          Kurz zdravého (ne)hubnutí v Hradci Králové (odkaz na informace o kurzu)
          <NuxtLink class="p-button p-button-brand" href="https://www.stob.cz/cs/kurz-zdraveho-ne-hubnuti-pro-deti-hradec-kralove-zakladni">
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
</style>
