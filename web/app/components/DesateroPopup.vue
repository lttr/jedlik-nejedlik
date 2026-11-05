<template>
  <dialog
    ref="dialog"
    class="desatero-popup"
    aria-labelledby="desatero-popup-title"
    @close="onClose"
    @click="onDialogClick"
  >
    <div class="content">
      <button type="button" class="close" aria-label="Zavřít" @click="close">
        <Icon name="bi:x-lg" aria-hidden="true" />
      </button>
      <p class="eyebrow">Zdarma ke stažení</p>
      <h2 id="desatero-popup-title" class="title">Cukrovíčkové desatero</h2>
      <p class="text">
        Chcete péct cukroví s&nbsp;dětmi v&nbsp;klidu? Začněte desaterem a&nbsp;vyzkoušejte, jestli
        vám náš přístup sedí.
      </p>
      <div class="actions">
        <NuxtLink :to="DESATERO_PATH" class="p-button p-button-brand" @click="convert">
          Chci desatero zdarma
        </NuxtLink>
        <button type="button" class="p-button p-button-secondary" @click="close">Teď ne</button>
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { StorageSerializers, useIdle, useStorage, useTimeoutFn } from "@vueuse/core"
import { useCookieConsent } from "../composables/cookie-consent"
import { DESATERO_PATH } from "./ebook-cukrovi/content"
import type { DesateroPopupRecord } from "../utils/desatero-popup"
import { canOfferDesatero } from "../utils/desatero-popup"

const record = useStorage<DesateroPopupRecord | null>("desatero-popup", null, undefined, {
  serializer: StorageSerializers.object,
})

function remember(status: DesateroPopupRecord["status"]): void {
  record.value = { status, at: new Date().toISOString() }
}

// Mounted once in app.vue, so the clock survives client-side navigation.
const { isPending: isWaiting } = useTimeoutFn(() => {}, 30_000)
const { idle } = useIdle(15_000)
const isDue = computed(() => !isWaiting.value || idle.value)

const route = useRoute()
const { isBarOpen } = useCookieConsent()
const dialog = useTemplateRef("dialog")

const shouldShow = computed(
  () => isDue.value && !isBarOpen.value && canOfferDesatero(route.path, record.value, new Date()),
)

watchEffect(() => {
  if (shouldShow.value && !dialog.value?.open) {
    dialog.value?.showModal()
  }
})

// Reaching the sign-up page by any route means the offer landed.
watch(
  () => route.path,
  (path) => {
    if (path === DESATERO_PATH) {
      remember("converted")
    }
    if (!canOfferDesatero(path, null, new Date())) {
      close()
    }
  },
  { immediate: true },
)

function convert(): void {
  remember("converted")
  close()
}

function close(): void {
  dialog.value?.close()
}

function onClose(): void {
  if (!record.value) {
    remember("dismissed")
  }
}

// A click on the dialog element itself, not its content, is the backdrop.
function onDialogClick(event: MouseEvent): void {
  if (event.target === dialog.value) {
    close()
  }
}
</script>

<style scoped>
.desatero-popup {
  width: min(100% - 2 * var(--space-4), 28rem);
  max-height: calc(100dvh - 2 * var(--space-4));
  padding: 0;
  border: none;
  border-radius: var(--radius-4);
  box-shadow: var(--shadow-5);

  &::backdrop {
    background-color: rgb(0 0 0 / 50%);
  }
}

.content {
  position: relative;
  padding: var(--space-7) var(--space-6) var(--space-6);
  text-align: center;

  @media (--sm-n-below) {
    padding-inline: var(--space-4);
  }
}

.close {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: none;
  border-radius: var(--radius-round);
  background: none;
  box-shadow: none;
  color: var(--text-color-2);
  cursor: pointer;
}

.eyebrow {
  margin: 0 0 var(--space-1);
  color: var(--color-brick-red);
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-6);
  text-transform: uppercase;
  letter-spacing: var(--font-letterspacing-2);
}

.title {
  margin: 0 0 var(--space-3);
  color: var(--brand-color);
  font-size: var(--font-size-4);
}

.text {
  margin: 0 auto var(--space-5);
  max-width: 34ch;
  color: var(--text-color-2);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}
</style>
