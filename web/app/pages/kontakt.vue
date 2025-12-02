<template>
  <PageWrapper>
    <h1>Kontakt</h1>
    <section class="p-switcher">
      <div class="email-block p-center p-cluster">
        <SvgoLogomarkCircle class="logomark-circle" />
        <a href="mailto:info@jedlik-nejedlik.cz">info@jedlik-nejedlik.cz</a>
      </div>

      <div class="p-stack">
        <h2 class="p-heading-3">Fakturační adresa</h2>
        <address>
          Jedlík-nejedlík, z. s.<br />
          K Lesu 334<br />
          50009 Hradec Králové<br />
          IČO: 19971192
        </address>
      </div>
    </section>
    <hr />
    <section class="sledujte-nas">
      <h2 class="p-heading-3 p-center">Sledujte nás</h2>
      <SocialLinks class="p-heading-3" />
    </section>
    <hr />
    <section class="hero p-switcher">
      <figure>
        <ProfileImg v-if="zdenkaPhoto" :image="zdenkaPhoto" />
        <figcaption class="p-heading-4">Zdeňka Trummová</figcaption>
      </figure>

      <div class="p-stack">
        <h2 class="question p-heading-3">
          Máte zájem o konzultaci, poradenství či o spolupráci v oblasti výživy?
        </h2>

        <p class="call-to-action">
          Ozvěte se mi na email nebo zanechte zprávu v kontaktním formuláři a já
          se vám brzy ozvu.
        </p>
      </div>
    </section>

    <div class="contacts p-flow">
      <p class="name p-base-text-bold">Zdeňka Trummová</p>

      <p>
        Nutriční poradkyně, lektorka výživy rodiny a zdravého životního stylu,
        pedagog, student nutriční terapie
      </p>

      <p>
        <a href="mailto:zdenka@jedlik-nejedlik.cz">zdenka@jedlik-nejedlik.cz</a>
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
h1 {
  margin-bottom: var(--space-4);
}

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
  max-width: var(--size-content-2);
  margin-block: var(--space-4);

  > * {
    --flow-space: 0.7em;
  }

  a {
    color: var(--text-color-1);
    text-decoration: underline;
  }
}

@media (--md-n-above) {
  .name {
    visibility: hidden;
  }
}

address {
  font-style: normal;
}

.sledujte-nas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.email-block {
  justify-content: center;

  a {
    color: var(--text-color-1);
    text-decoration: underline;
  }
}
</style>
