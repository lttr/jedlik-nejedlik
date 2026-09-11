<template>
  <aside v-if="isBarOpen" ref="bar" class="consent-bar" aria-label="Souhlas s cookies">
    <p class="text p-secondary-text-regular">
      Používáme cookies a další technologie, abychom vám mohli nabídnout lepší služby. Více v
      <NuxtLink class="link" to="/zasady-zpracovani-osobnich-udaju#cookies"
        >zásadách zpracování osobních údajů</NuxtLink
      >.
    </p>
    <!-- Both choices weigh the same: same class, same size, same colours. -->
    <div class="p-cluster">
      <button type="button" class="p-button" @click="decide('granted')">Přijmout</button>
      <button type="button" class="p-button" @click="decide('denied')">Odmítnout</button>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { useElementSize } from "@vueuse/core"

const { isBarOpen, decide } = useCookieConsent()

// The bar is fixed over the bottom of the page, so without this the footer's
// last links — the consent control among them — sit under it and no amount of
// scrolling reaches them. It wraps to several lines at 375px, hence measuring
// rather than guessing a height.
const bar = useTemplateRef("bar")
const { height } = useElementSize(bar, undefined, { box: "border-box" })
useHead({
  bodyAttrs: {
    style: computed(() => (isBarOpen.value ? `padding-block-end: ${height.value}px` : "")),
  },
})
</script>

<style scoped>
.consent-bar {
  /* Puleo's focus ring defaults to --brand-color, near-invisible on the midnight bar. */
  --focus-color: var(--color-pale-blue);

  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-6);
  align-items: center;
  justify-content: center;
  padding: var(--space-5) var(--space-4);
  color: var(--text-color-1-inverse);
  background-color: var(--color-midnight);
  box-shadow: var(--shadow-4);
  line-height: var(--font-lineheight-3);
}

.text {
  margin: 0;
  max-width: 60ch;
}

.link {
  color: var(--text-color-2-inverse);
}
</style>
