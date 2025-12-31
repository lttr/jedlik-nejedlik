<template>
  <PageWrapper class="thank-you-page">
    <div class="thank-you-content">
      <Icon name="uil:check-circle" class="success-icon" />
      <h1>Děkujeme za Váš zájem</h1>
      <p class="lead">Přihlášení k odběru newsletteru proběhlo úspěšně.</p>
      <p class="team-signature">Tým Jedlík-nejedlík</p>
      <NuxtLink to="/pro-rodice" class="p-button p-button-brand">
        Zpět na stránku Pro rodiče
      </NuxtLink>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
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

.team-signature {
  font-weight: var(--font-weight-6);
  color: var(--brand-color);
  margin-bottom: var(--space-5);
}

.thank-you-content .p-button {
  margin-top: var(--space-4);
}
</style>
