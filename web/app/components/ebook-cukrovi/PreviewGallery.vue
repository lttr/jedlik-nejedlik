<template>
  <div class="preview-grid">
    <button
      v-for="(id, index) of PREVIEW_IMAGE_IDS"
      :key="id"
      type="button"
      class="preview-thumbnail"
      :aria-label="`Zvětšit ukázku, strana ${index + 1}`"
      @click="openLightbox(index)"
    >
      <NuxtImg
        :src="id"
        provider="directus"
        width="220"
        height="311"
        :alt="`Ukázka z e-booku, strana ${index + 1}`"
        loading="lazy"
      />
    </button>
  </div>

  <dialog ref="lightboxDialog" class="lightbox">
    <div class="lightbox-content">
      <button type="button" class="lightbox-close" aria-label="Zavřít" @click="closeLightbox">
        <Icon name="bi:x-lg" />
      </button>
      <button
        type="button"
        class="lightbox-nav"
        :disabled="currentIndex === 0"
        aria-label="Předchozí"
        @click="showImage(currentIndex - 1)"
      >
        <Icon name="bi:chevron-left" />
      </button>
      <div class="lightbox-image">
        <NuxtImg
          :key="currentIndex"
          :src="PREVIEW_IMAGE_IDS[currentIndex]"
          provider="directus"
          width="800"
          :alt="`Ukázka z e-booku, strana ${currentIndex + 1}`"
        />
      </div>
      <button
        type="button"
        class="lightbox-nav"
        :disabled="currentIndex === PREVIEW_IMAGE_IDS.length - 1"
        aria-label="Další"
        @click="showImage(currentIndex + 1)"
      >
        <Icon name="bi:chevron-right" />
      </button>
      <div class="lightbox-counter">{{ currentIndex + 1 }} / {{ PREVIEW_IMAGE_IDS.length }}</div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { PREVIEW_IMAGE_IDS } from "./content"

const lightboxDialog = useTemplateRef<HTMLDialogElement>("lightboxDialog")
const currentIndex = ref(0)

function openLightbox(index: number) {
  currentIndex.value = index
  lightboxDialog.value?.showModal()
}

function closeLightbox() {
  lightboxDialog.value?.close()
}

function closeOnBackdrop(event: MouseEvent) {
  if (event.target === lightboxDialog.value) {
    closeLightbox()
  }
}

function showImage(index: number) {
  currentIndex.value = Math.min(Math.max(index, 0), PREVIEW_IMAGE_IDS.length - 1)
}

useEventListener(lightboxDialog, "click", closeOnBackdrop)

// Escape is handled by the dialog itself.
useEventListener(lightboxDialog, "keydown", (event: KeyboardEvent) => {
  if (event.key === "ArrowRight") {
    showImage(currentIndex.value + 1)
  } else if (event.key === "ArrowLeft") {
    showImage(currentIndex.value - 1)
  }
})
</script>

<style scoped>
.preview-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
}

.preview-thumbnail {
  display: block;
  width: 180px;
  height: auto;
  aspect-ratio: 1240 / 1753;
  padding: 0;
  border: none;
  border-radius: var(--radius-2);
  background: white;
  overflow: hidden;
  box-shadow: var(--shadow-3);
  cursor: zoom-in;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:nth-child(odd) {
    transform: rotate(-2deg);
  }

  &:nth-child(even) {
    transform: rotate(2deg);
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: var(--shadow-5);
  }

  &:focus-visible {
    outline: 3px solid var(--color-burgundy-red);
    outline-offset: 3px;
  }

  :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (--sm-n-below) {
    width: 140px;
  }
}

.lightbox {
  max-width: 100vw;
  max-height: 100vh;
  margin: auto;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  overflow: visible;

  &::backdrop {
    background: rgb(255 255 255 / 80%);
    backdrop-filter: blur(8px);
  }
}

.lightbox-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-4);

  @media (--sm-n-below) {
    gap: var(--space-2);
    padding: var(--space-2);
  }
}

.lightbox-image {
  max-width: min(800px, 90vw);
  max-height: 85vh;

  :deep(img) {
    display: block;
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
  }
}

.lightbox-close,
.lightbox-nav {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-round);
  background: var(--surface-1);
  color: var(--text-color-1);
  box-shadow: var(--shadow-2);
  cursor: pointer;

  &:hover:not(:disabled) {
    background: white;
  }

  &:focus-visible {
    outline: 2px solid var(--color-burgundy-red);
    outline-offset: 2px;
  }
}

.lightbox-close {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 44px;
  height: 44px;
  font-size: var(--font-size-2);
}

.lightbox-nav {
  width: 48px;
  height: 48px;
  font-size: var(--font-size-3);

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (--sm-n-below) {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-1);
  }
}

.lightbox-counter {
  position: absolute;
  bottom: var(--space-2);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-round);
  background: var(--surface-1);
  color: var(--text-color-2);
  font-size: var(--font-size--1);
  box-shadow: var(--shadow-2);
}
</style>
