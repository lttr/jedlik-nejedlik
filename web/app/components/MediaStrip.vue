<template>
  <section class="media-strip p-full-bg" :aria-label="label">
    <div class="media-row">
      <span class="media-label">{{ label }}</span>
      <ul class="media-list">
        <li v-for="outlet of OUTLETS" :key="outlet.name">
          <a :href="outlet.href" target="_blank" rel="noopener">{{ outlet.name }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
const { label } = defineProps<{ label: string }>()

// CLAIM: waits for Zdeňka to confirm the outlets.
const OUTLETS = [
  {
    name: "ČT24",
    href: "https://ct24.ceskatelevize.cz/clanek/kultura/uspesny-film-zivot-k-sezrani-vypravi-o-detske-obezite-354127",
  },
  {
    name: "iDNES.cz",
    href: "https://www.idnes.cz/hradec-kralove/zpravy/zdenka-trummova-vyziva-poradkyne-obezita-deti-jidlo-rodice.A241217_160035_hradec-zpravy_tuu",
  },
  {
    name: "Český rozhlas",
    href: "https://www.mujrozhlas.cz/na-nedelni-vlne-hradce-kralove/zdenka-trummova-se-v-mladi-hodne-prala-s-obezitou-ted-sama-pomaha",
  },
  {
    name: "Deník N",
    href: "https://denikn.cz/1961488/rozhovor-pro-rodice-jedliku-jak-poznat-ze-diteti-chutna-a-kdy-uz-je-to-problem/",
  },
]
</script>

<style scoped>
.media-strip {
  padding-block: var(--space-6);
  border-bottom: 1px solid var(--surface-2);
}

.media-row,
.media-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-2) var(--space-7);
}

.media-label {
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-6);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-navy) 72%, white);
}

.media-list {
  padding: 0;
  list-style: none;

  a {
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-7);
    color: var(--color-navy);
    text-decoration: none;
    opacity: 0.75;

    &:hover {
      opacity: 1;
      text-decoration: underline;
    }
  }
}
</style>
