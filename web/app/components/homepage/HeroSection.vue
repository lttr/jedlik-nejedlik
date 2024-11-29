<template>
  <section class="hero p-padded-end">
    <div>
      <div class="switcher p-switcher">
        <h1 class="heading">Zdraví na talíři, pohoda u stolu</h1>
      </div>
    </div>

    <p class="subheading">
      Pomáháme rodičům zvládat náročné situace okolo jídla a vyšlapávat cesty ke
      zdravému vztahu k jídlu napříč rodinou. Vycházíme z konceptu výživy a
      výchovy v propojení. Jídlo je naučená dovednost a věříme, že vždy existuje
      způsob, jak se projíst k větší spokojenosti u stolu a zároveň nerezignovat
      na výživu. Vycházíme z odborných výživových poznatků, které opakovaně
      prokazují, že strava a zdravý životní styl jsou základními nástroji zdraví
      - <strong>na tom, co naše děti jedí, záleží</strong>.
    </p>
  </section>
</template>

<script lang="ts" setup></script>

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

.subheading {
  margin-top: var(--space-6);
  max-width: var(--size-content-3);
  text-wrap: pretty;
}
</style>
