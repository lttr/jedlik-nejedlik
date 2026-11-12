<template>
  <header>
    <div class="top-bar p-full p-page-layout">
      <div class="top-line">
        <PromoBar :promo="CURRENT_PROMO" />
        <SocialLinks class="social" />
      </div>
    </div>

    <MainNav class="p-full" />
  </header>
</template>

<script lang="ts" setup>
import MainNav from "./MainNav.vue"
import { CURRENT_PROMO } from "./promo"
import PromoBar from "./PromoBar.vue"
import SocialLinks from "./SocialLinks.vue"
</script>

<style scoped>
.top-bar {
  background-color: var(--color-midnight);
  color: rgb(255 255 255 / 85%);
}

.top-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-5);
  padding-block: var(--space-2);
  font-size: 0.875rem;

  @media (--sm-n-below) {
    font-size: 0.8125rem;
  }
}

.social {
  margin-inline-start: auto;
  color: white;
  font-size: var(--font-size-0);
}
</style>
