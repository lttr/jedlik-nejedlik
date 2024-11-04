<template>
  <section class="hero p-padded-end">
    <div>
      <div class="switcher p-switcher">
        <h1 class="heading">Aby každé jídlo bylo radost</h1>
        <NuxtImg
          class="image"
          :src="data?.image"
          :alt="data?.label"
          width="770"
          height="500"
        />
      </div>
    </div>

    <p class="subheading">
      Pomáháme rodičům zvládat náročné situace okolo jídla a vyšlapávat cesty ke
      zdravému vztahu k jídlu napříč rodinou. Vycházíme z konceptu výživy a
      výchovy v propojení. Věříme, že jídlo je naučená dovednost a vždy existuje
      způsob, jak se projíst ke spokojenosti u stolu. Zároveň vycházíme z
      odborných výživových poznatků, které opakovaně prokazují, že strava a
      zdravý životní styl jsou základními nástroji zdraví - na tom, co naše děti
      jedí, záleží.
    </p>
  </section>
</template>

<script lang="ts" setup>
const { data } = await useKeyImage(1)
</script>

<style scoped>
.hero {
  margin-top: var(--space-4-6);
}

.switcher {
  --switcher-treshold: 29ch;
}

.heading {
  max-width: var(--size-header-1);
}

.image {
  max-width: min(var(--size-content-3), 100%);
}

.subheading {
  margin-top: var(--space-6);
  max-width: var(--size-content-3);
}
</style>
