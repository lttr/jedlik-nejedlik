<template>
  <PageWrapper>
    <header class="page-header">
      <h1>Cukrovíčkové desatero zdarma</h1>
      <p class="lead">
        Ještě váháte s&nbsp;e-bookem? Začněte desaterem a&nbsp;vyzkoušejte, jestli vám náš přístup
        sedí.
      </p>
    </header>

    <section class="newsletter">
      <NewsletterForm
        title="Kam vám ho máme poslat?"
        description="Přihlaste se k&nbsp;odběru newsletteru a&nbsp;desatero si stáhnete hned po odeslání."
        highlight="Vyplňte e-mail a&nbsp;desatero je vaše."
        button-text="Získat desatero"
        redirect-path="/dekujeme-za-zajem-o-newsletter?pdf=cukrovickove-desatero"
      />
    </section>

    <p class="ebook-link">
      <NuxtLink to="/ebook-vanocni-cukrovi">Zpět na e-book Cukroví s&nbsp;dětmi</NuxtLink>
    </p>
  </PageWrapper>
</template>

<script lang="ts" setup>
import NewsletterForm from "../components/NewsletterForm.vue"
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"

useSeoMeta({
  title: "Cukrovíčkové desatero zdarma",
  description:
    "Stáhněte si zdarma Cukrovíčkové desatero od Jedlík-nejedlík pro klidnější Vánoce s dětmi.",
})
</script>

<style scoped>
.page-header {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding-block: var(--space-6) var(--space-4);
  text-align: center;
}

.newsletter {
  max-width: var(--size-content-3);
  margin-block: var(--space-6);
  margin-inline: auto;
}

.ebook-link {
  margin-bottom: var(--space-8);
  text-align: center;
}
</style>
