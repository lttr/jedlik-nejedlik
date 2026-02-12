<template>
  <PageWrapper class="thank-you-page">
    <div class="thank-you-content">
      <Icon name="uil:check-circle" class="success-icon" />
      <h1>Děkujeme za Váš zájem</h1>
      <p class="lead">Přihlášení k odběru newsletteru proběhlo úspěšně.</p>

      <template v-if="pdfDownload">
        <p class="gift-text">
          Jako poděkování si můžete stáhnout
          <strong>{{ pdfDownload.label }}</strong
          >.
        </p>
        <a
          :href="pdfDownload.url"
          download
          class="p-button p-button-brand p-button-large download-button"
        >
          Stáhnout {{ pdfDownload.label }}
        </a>
      </template>

      <p class="team-signature">Tým Jedlík-nejedlík</p>
      <NuxtLink to="/pro-rodice" class="p-button p-button-brand">
        Zpět na stránku Pro rodiče
      </NuxtLink>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { DIRECTUS_URL } from "~~/shared/utils/directus"

const PDF_MAP: Record<string, { fileId: string; label: string }> = {
  "nejedlici-checklist": {
    fileId: "a50cceb7-1ca5-4f16-bcdf-10515cae0ff7",
    label: "Check list pro rodiče nejedlíků",
  },
}

const route = useRoute()
const pdfKey = route.query.pdf as string | undefined
const pdfDownload =
  pdfKey && PDF_MAP[pdfKey]
    ? {
        ...PDF_MAP[pdfKey],
        url: `${DIRECTUS_URL}/assets/${PDF_MAP[pdfKey].fileId}?download`,
      }
    : null

useSeoMeta({
  title: "Děkujeme za přihlášení k newsletteru",
  description:
    "Vaše přihlášení k newsletteru Jedlík-nejedlík bylo úspěšně zpracováno.",
})
</script>

<style scoped>
.thank-you-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thank-you-content {
  text-align: center;
  max-width: var(--size-content-2);
  padding: var(--space-8) var(--space-4);
}

.success-icon {
  font-size: 4rem;
  color: var(--color-forest-green);
  margin-bottom: var(--space-4);
}

.thank-you-content h1 {
  font-size: var(--font-size-4);
  color: var(--brand-color);
  margin-bottom: var(--space-4);
}

.thank-you-content .lead {
  font-size: var(--font-size-2);
  color: var(--text-1);
  margin-bottom: var(--space-3);
}

.thank-you-content p {
  color: var(--text-2);
  margin-bottom: var(--space-3);
}

.gift-text {
  font-size: var(--font-size-1);
}

.download-button {
  margin-bottom: var(--space-5);
  font-size: var(--font-size-1);
  padding: var(--space-4) var(--space-5);
  line-height: var(--font-lineheight-3);
  height: auto;
}

.team-signature {
  font-weight: var(--font-weight-6);
  color: var(--brand-color);
  margin-bottom: var(--space-5);
}

.thank-you-content .p-button {
  margin-top: var(--space-4);
}
</style>
