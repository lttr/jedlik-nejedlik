<template>
  <aside v-if="promo && isShown" class="promo" aria-label="Upoutávka">
    <span class="dot" aria-hidden="true"></span>
    <p class="text">
      {{ promo.label }} <strong>{{ promo.name }}</strong
      ><span class="price"> · {{ promo.price }}</span>
      <NuxtLink :to="promo.to" class="cta">{{ promo.cta }}&nbsp;→</NuxtLink>
    </p>
    <button type="button" class="close" aria-label="Zavřít" @click="dismiss">
      <Icon name="bi:x-lg" aria-hidden="true" />
    </button>
  </aside>
</template>

<script lang="ts" setup>
import type { Promo } from "./promo"
import { isPromoShownOn } from "./promo"

const { promo } = defineProps<{ promo: Promo | null }>()

// No maxAge: a session cookie, readable on the server, so the bar renders
// there and never pops in or mismatches on hydration.
const dismissedId = useCookie<string | null>("promo-bar-dismissed", {
  default: () => null,
  sameSite: "lax",
})

const route = useRoute()

const isShown = computed(
  () => promo !== null && dismissedId.value !== promo.id && isPromoShownOn(promo, route.path),
)

function dismiss(): void {
  if (promo) {
    dismissedId.value = promo.id
  }
}
</script>

<style scoped>
.promo {
  display: flex;
  /* About the one-line width: anything narrower drops the social links to
     their own row instead of squeezing the promo into three lines. */
  flex: 1 1 36rem;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.dot {
  flex-shrink: 0;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: var(--radius-round);
  background-color: var(--color-star);

  @media (--sm-n-below) {
    display: none;
  }
}

.text {
  min-width: 0;
  margin: 0;
  font-size: inherit;
  line-height: 1.4;

  strong {
    color: white;
    white-space: nowrap;
    font-weight: var(--font-weight-6);
  }
}

.price {
  white-space: nowrap;
}

.cta {
  margin-inline-start: var(--space-2);
  color: white;
  font-weight: var(--font-weight-6);
  text-decoration: underline;
  text-underline-offset: 0.2em;
  white-space: nowrap;

  &:visited {
    color: white;
  }

  &:hover {
    color: var(--color-star);
  }
}

.close {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  border-radius: var(--radius-round);
  background: none;
  box-shadow: none;
  color: inherit;
  font-size: var(--font-size--1);
  opacity: 0.7;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
}
</style>
