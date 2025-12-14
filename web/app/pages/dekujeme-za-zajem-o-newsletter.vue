<template>
  <PageWrapper class="thank-you-page">
    <div class="thank-you-content">
      <Icon name="uil:check-circle" class="success-icon" />
      <h1>Děkujeme za Váš zájem</h1>
      <p class="lead">Přihlášení k odběru newsletteru proběhlo úspěšně.</p>
      <p class="gift-text">
        Jako poděkování si můžete stáhnout
        <strong>Cukrovíčkové desatero</strong>
        – praktický checklist pro zdravější Vánoce.
      </p>
      <a
        :href="checklistUrl"
        download
        class="p-button p-button-brand p-button-large download-button"
      >
        Stáhnout Cukrovíčkové desatero
      </a>
      <div class="upsell-box">
        <p class="upsell-heading">Chcete vědět víc?</p>
        <p class="upsell-text">
          Detailní popis doporučení z desatera a mnoho navíc získáte v e-booku
        </p>
        <p class="upsell-ebook-name">Cukroví s dětmi a v pohodě</p>
        <p class="upsell-deadline">Akce platí do 21.&nbsp;12.&nbsp;2025</p>
        <NuxtLink to="/ebook-vanocni-cukrovi" class="p-button p-button-brand">
          Zjistit více o e-booku
        </NuxtLink>
      </div>
      <p class="team-signature">Tým Jedlík-nejedlík</p>
      <NuxtLink to="/pro-rodice" class="back-link">
        ← Zpět na stránku Pro rodiče
      </NuxtLink>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { DIRECTUS_URL } from "~~/shared/utils/directus"

const CHECKLIST_FILE_ID = "d5f38263-a202-4c27-b0aa-b15c4a8d8851"
const checklistUrl = `${DIRECTUS_URL}/assets/${CHECKLIST_FILE_ID}?download`

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
  color: var(--text-1);
  margin-bottom: var(--space-4);
}

.download-button {
  margin-bottom: var(--space-5);
  font-size: var(--font-size-1);
  padding: var(--space-4) var(--space-5);
  line-height: var(--font-lineheight-3);
  height: auto;
}

.upsell-box {
  margin-block: var(--space-6);
  padding: var(--space-5);
  background: var(--surface-2);
  border-radius: var(--radius-3);
  text-align: center;
}

.upsell-heading {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  color: var(--brand-color);
  margin: 0 0 var(--space-2);
}

.upsell-text {
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin: 0 0 var(--space-1);
}

.upsell-ebook-name {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  margin: 0 0 var(--space-2);
}

.upsell-deadline {
  font-size: var(--font-size--1);
  color: var(--text-2);
  margin: 0 0 var(--space-3);
}

.team-signature {
  font-weight: var(--font-weight-6);
  color: var(--brand-color);
  margin-bottom: var(--space-3);
}

.back-link {
  margin-top: var(--space-2);
  color: var(--text-2);
  font-size: var(--font-size--1);
}
</style>
