<template>
  <aside v-if="isBarOpen" class="consent-bar" aria-label="Souhlas s cookies">
    <p class="text p-secondary-text-regular">
      Pro cílení reklamy na Facebooku a Instagramu potřebujeme váš souhlas s cookies. Návštěvnost
      webu měříme bez nich. Více v
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
const { isBarOpen, decide } = useCookieConsent()
</script>

<style scoped>
.consent-bar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-6);
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-4);
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
