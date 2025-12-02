<template>
  <PageSection class="experts">
    <SvgoSpirala class="spirala" />
    <div class="wrapper p-switcher">
      <div class="p-stack">
        <span class="chip">o nás</span>
        <h2 class="heading">Výživa a výchova v&nbsp;propojení</h2>
      </div>
      <p class="description">
        Pomáháme rodičům zvládat náročné situace okolo jídla a vyšlapávat cesty
        ke zdravému vztahu k jídlu napříč&nbsp;rodinou.
      </p>
      <NuxtLink class="cta p-button" to="/o-nas">Více o projektu</NuxtLink>
    </div>
  </PageSection>
</template>

<script lang="ts" setup></script>

<style scoped>
.experts {
  background-color: var(--color-light-lime);
  color: var(--color-forest-green);
}

.wrapper {
  align-items: center;
  --cluster-space: var(--space-7);
  --switcher-treshold: 40ch;
}

.heading {
  margin-top: var(--space-2);
  max-width: none;
}

.description {
  min-width: var(--size-content-1);
  text-wrap: pretty;
}

.cta {
  font-size: var(--font-size--1);
  max-width: fit-content;
  box-shadow: none;
  background-color: var(--color-burgundy-red);
  color: white;
  border: var(--border-size-2) solid var(--color-burgundy-red);
}

.cta:hover {
  background-color: color-mix(in srgb, var(--color-burgundy-red) 85%, black);
  border-color: color-mix(in srgb, var(--color-burgundy-red) 85%, black);
}

.cta:active {
  background-color: color-mix(in srgb, var(--color-burgundy-red) 70%, black);
  border-color: color-mix(in srgb, var(--color-burgundy-red) 70%, black);
}

.spirala {
  position: absolute;
  transform: rotate(-16deg) translate(6ch, -7ex) scale(1, -1);
  width: 8ch;
  stroke-width: 0.8rem;
}

.chip {
  width: fit-content;
  font-size: var(--font-size--1);
  padding-inline: var(--space-2);
  padding-block: 3px;
  border-radius: var(--radius-default);
  border: var(--border-size-1) solid var(--color-forest-green);
  color: var(--color-forest-green);
}
</style>
