<template>
  <ThankYouPage title="Děkujeme za Váš zájem">
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

    <template #action>
      <NuxtLink to="/pro-rodice" class="p-button p-button-brand">
        Zpět na stránku Pro rodiče
      </NuxtLink>
    </template>
  </ThankYouPage>
</template>

<script lang="ts" setup>
const PDF_MAP: Record<string, { fileId: string; label: string }> = {
  "nejedlici-checklist": {
    fileId: "a50cceb7-1ca5-4f16-bcdf-10515cae0ff7",
    label: "Check list pro rodiče nejedlíků",
  },
  "zdrave-svacinky": {
    fileId: "02e757ef-ed0a-4ba3-850d-7643c309d23e",
    label: "Zdravé svačinky pro mého školáka",
  },
}

const directusUrl = useRuntimeConfig().public.directusUrl
const route = useRoute()
const pdfKey = route.query.pdf as string | undefined
const pdfDownload =
  pdfKey && PDF_MAP[pdfKey]
    ? {
        ...PDF_MAP[pdfKey],
        url: `${directusUrl}/assets/${PDF_MAP[pdfKey].fileId}?download`,
      }
    : null

useSeoMeta({
  title: "Děkujeme za přihlášení k newsletteru",
  description: "Vaše přihlášení k newsletteru Jedlík-nejedlík bylo úspěšně zpracováno.",
})
</script>

<style scoped>
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
</style>
