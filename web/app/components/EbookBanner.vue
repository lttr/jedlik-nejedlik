<template>
  <Transition name="slide">
    <aside v-if="isShown" class="ebook-banner" aria-label="Nabídka e-booku">
      <NuxtLink
        :to="EBOOK_PATH"
        class="cover-link"
        tabindex="-1"
        aria-hidden="true"
        @click="convert"
      >
        <EbookCover />
      </NuxtLink>
      <div class="body">
        <p class="title">Chystáte se na Vánoce s&nbsp;dětmi?</p>
        <p class="text">
          Praktický e-book, jak dát dětem sladké a&nbsp;neztratit nervy. Tipy podle věku za
          290&nbsp;Kč.
        </p>
        <NuxtLink :to="EBOOK_PATH" class="cta" @click="convert">Chci e-book</NuxtLink>
        <NuxtLink :to="DESATERO_PATH" class="secondary" @click="convert"
          >Desatero zdarma →</NuxtLink
        >
      </div>
      <button type="button" class="close" aria-label="Zavřít" @click="dismiss">
        <Icon name="bi:x-lg" aria-hidden="true" />
      </button>
    </aside>
  </Transition>
</template>

<script lang="ts" setup>
import { StorageSerializers, useIdle, useStorage, useTimeoutFn } from "@vueuse/core"
import { useCookieConsent } from "../composables/cookie-consent"
import type { EbookBannerRecord } from "../utils/ebook-banner"
import { canOfferEbook } from "../utils/ebook-banner"
import { DESATERO_PATH } from "./ebook-cukrovi/content"
import EbookCover from "./ebook-cukrovi/EbookCover.vue"
import { EBOOK_PATH } from "./home/content"

const record = useStorage<EbookBannerRecord | null>("ebook-banner", null, undefined, {
  serializer: StorageSerializers.object,
})

function remember(status: EbookBannerRecord["status"]): void {
  record.value = { status, at: new Date().toISOString() }
}

// Mounted once in app.vue, so the clock survives client-side navigation.
const { isPending: isWaiting } = useTimeoutFn(() => {}, 30_000)
const { idle } = useIdle(15_000)
const isDue = computed(() => !isWaiting.value || idle.value)

const route = useRoute()
const { isBarOpen } = useCookieConsent()

const isShown = computed(
  () => isDue.value && !isBarOpen.value && canOfferEbook(route.path, record.value, new Date()),
)

// Reaching either offer by any route means the banner did its job.
watch(
  () => route.path,
  (path) => {
    if (path === EBOOK_PATH || path === DESATERO_PATH) {
      remember("converted")
    }
  },
  { immediate: true },
)

function convert(): void {
  remember("converted")
}

function dismiss(): void {
  remember("dismissed")
}
</script>

<style scoped>
.ebook-banner {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  z-index: 10;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-4);
  align-items: start;
  width: min(100% - 2 * var(--space-4), 28rem);
  padding: var(--space-4);
  border-radius: var(--radius-4);
  background-color: var(--surface-0);
  box-shadow: var(--shadow-4);
  line-height: var(--font-lineheight-3);

  @media (--sm-n-below) {
    right: var(--space-2);
    bottom: var(--space-2);
    gap: var(--space-3);
    width: calc(100% - 2 * var(--space-2));
    padding: var(--space-3);
  }
}

.cover-link {
  display: block;
  width: 5.25rem;
  text-decoration: none;

  @media (--sm-n-below) {
    width: 4.2rem;
  }
}

.body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);

  > p {
    margin: 0;
  }
}

.title {
  color: var(--brand-color);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-7);
  line-height: 1.25;
}

.text {
  color: var(--text-color-2);
  font-size: var(--font-size--1);

  @media (--sm-n-below) {
    display: none;
  }
}

.cta {
  margin-top: var(--space-1);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-round);
  background-color: var(--color-brick-red);
  color: white;
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  text-decoration: none;

  &:hover {
    background-color: var(--color-brick-red-dark);
  }
}

.secondary {
  color: var(--brand-color);
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-6);
}

.close {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: var(--radius-round);
  background-color: var(--color-peach);
  box-shadow: none;
  color: var(--brand-color);
  cursor: pointer;
}

@media (prefers-reduced-motion: no-preference) {
  .slide-enter-active,
  .slide-leave-active {
    transition:
      transform 300ms var(--ease-3),
      opacity 300ms var(--ease-3);
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: translateY(1rem);
    opacity: 0;
  }
}
</style>
