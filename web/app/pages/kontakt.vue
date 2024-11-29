<template>
  <PageWrapper>
    <h1>Kontakt</h1>
    <div class="hero p-switcher">
      <figure>
        <ProfileImg :image="zdenkaPhoto" />
        <figcaption class="p-heading-4">Zdeňka Trummová</figcaption>
      </figure>

      <div class="p-stack">
        <h2 class="question p-heading-3">
          Máte zájem o konzultaci, poradenství či o spolupráci v oblasti výživy?
        </h2>

        <p class="call-to-action">
          Ozvěte se mi na email či níže uvedené telefonní číslo nebo zanechte
          zprávu v kontaktním formuláři a já se vám brzy ozvu.
        </p>
      </div>
    </div>

    <div class="contacts p-flow">
      <p class="name p-base-text-bold">Zdeňka Trummová</p>

      <p>
        Nutriční poradkyně, lektorka výživy rodiny a zdravého životního stylu,
        pedagog, student nutriční terapie
      </p>

      <p>
        <a href="tel:732651959">732 651 959</a>
      </p>

      <p>
        <a href="mailto:zdenka.trummova@seznam.cz">zdenka.trummova@seznam.cz</a>
      </p>

      <p>
        <SocialLinks class="social-links" />
      </p>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: zdenkaPhoto } = await useDirectusImage(
  "a64de3ab-044d-46c7-9e4c-64f3854e93d0",
)
</script>

<style scoped>
figure {
  display: flex;
  flex-direction: column;
  width: fit-content;
  align-items: center;

  figcaption {
    color: var(--text-color-1);
  }
}

.hero {
  align-items: center;
}

.question {
  max-width: var(--size-content-2);
  text-wrap: balance;
}

.call-to-action {
  max-width: var(--size-content-2);
}

.contacts {
  > * {
    --flow-space: 0.7em;
  }
  max-width: var(--size-content-2);
}

.social-links {
  font-size: var(--font-size-4);
  color: var(--link-color);
}

@media (--md-n-above) {
  .name {
    visibility: hidden;
  }
}
</style>
