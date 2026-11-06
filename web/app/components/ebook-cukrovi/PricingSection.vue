<template>
  <section id="koupit" class="section cream p-full-bg">
    <div class="pricing">
      <div class="pricing-side">
        <div class="pricing-cover"><EbookCover /></div>
        <p class="price">{{ PRICE }}</p>
        <p class="price-note">Nákupem podpoříte neziskovou organizaci Jedlík-nejedlík</p>
      </div>
      <div class="pricing-main">
        <h2 class="sub-title">Co přesně dostanete</h2>
        <ul class="package-list">
          <li v-for="item of PACKAGE_ITEMS" :key="item.before + item.strong">
            <CheckMark class="check" />
            <span
              >{{ item.before }}<strong v-if="item.strong">{{ item.strong }}</strong
              >{{ item.after }}</span
            >
          </li>
        </ul>
        <p class="bonus">
          <strong>{{ BONUS.title }}</strong> {{ BONUS.text }}
        </p>
        <BuyLink size="big" class="buy-full" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import CheckMark from "./CheckMark.vue"
import BuyLink from "./BuyLink.vue"
import { BONUS, PACKAGE_ITEMS, PRICE } from "./content"
import EbookCover from "./EbookCover.vue"
</script>

<style scoped>
.pricing {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  width: 100%;
  max-width: 58rem;
  margin-inline: auto;
  border-radius: 2.25rem;
  background: white;
  box-shadow: 0 24px 60px rgb(10 26 87 / 12%);
  overflow: hidden;

  @media (--md-n-below) {
    grid-template-columns: 1fr;
  }
}

.pricing-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-7);
  background-color: var(--color-brick-red);
  color: var(--color-peach);
  text-align: center;
}

.pricing-cover {
  width: 10.5rem;
}

.price {
  margin-top: var(--space-7);
  font-size: 3.5rem;
  font-weight: var(--font-weight-7);
  line-height: 1;
}

.price-note {
  margin-top: var(--space-2);
  font-size: var(--font-size--1);
}

.pricing-main {
  padding: var(--space-7);

  @media (--md-n-below) {
    padding: var(--space-5);
  }
}

.package-list {
  margin-top: var(--space-3);
  padding: 0;
  list-style: none;

  li {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    padding-block: var(--space-2);
    line-height: 1.5;
  }
}

.bonus {
  margin-top: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-3);
  background-color: var(--color-light-lime);
  font-size: var(--font-size--1);
}

.buy-full {
  width: 100%;
  margin-top: var(--space-5);
}
</style>
