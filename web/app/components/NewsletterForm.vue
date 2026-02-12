<template>
  <div class="newsletter-section">
    <div class="newsletter-header">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <p class="highlight">{{ highlight }}</p>
    </div>

    <slot />

    <div class="form-wrapper">
      <form class="form" @submit.prevent="onSubmit">
        <div class="form-row">
          <div class="p-form-group">
            <label for="newsletter-firstname">Křestní jméno</label>
            <input
              id="newsletter-firstname"
              type="text"
              name="first_name"
              autocomplete="given-name"
            />
          </div>

          <div class="p-form-group">
            <label for="newsletter-lastname">Příjmení</label>
            <input
              id="newsletter-lastname"
              type="text"
              name="last_name"
              autocomplete="family-name"
            />
          </div>
        </div>

        <div class="p-form-group">
          <label for="newsletter-email">E-mailová adresa *</label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            autocomplete="email"
            placeholder="vas@email.cz"
          />
        </div>

        <p class="consent-note">
          Odesláním údajů souhlasím s tím, abych dostával/a na svůj e-mail
          zprávy s novinkami od Jedlík-nejedlík. Souhlas mohu kdykoli odvolat
          prostřednictvím odhlašovacího odkazu v každé zprávě.
          <NuxtLink to="/zasady-zpracovani-osobnich-udaju"
            >Zásady zpracování osobních údajů</NuxtLink
          >
        </p>

        <div class="p-center">
          <button
            type="submit"
            class="p-button-brand"
            :disabled="isPendingOrSuccess"
          >
            {{ buttonText }}
          </button>
        </div>

        <div v-if="error" class="error-message">{{ error.message }}</div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    highlight?: string
    buttonText?: string
    redirectPath?: string
  }>(),
  {
    title: "Newsletter pro rodiče",
    description:
      "Nechte si posílat ty nejlepší tipy, novinky a inspiraci ze světa dětské výživy přímo do své e-mailové schránky.",
    highlight: "S naším newsletterem vám nic neunikne.",
    buttonText: "Odebírat novinky",
    redirectPath: "/dekujeme-za-zajem-o-newsletter",
  },
)

const router = useRouter()
const { execute, error, isSuccess, isPendingOrSuccess } =
  useNewsletterParentsForm()

async function onSubmit(event: Event) {
  const form = event.target as HTMLFormElement
  await execute(new FormData(form))
  if (isSuccess.value) {
    router.push(props.redirectPath)
  }
}
</script>

<style scoped>
.newsletter-section {
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.newsletter-header {
  text-align: center;
  margin-bottom: var(--space-5);
}

.newsletter-header h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-4);
  color: var(--brand-color);
}

.newsletter-header p {
  margin: 0;
  color: var(--text-2);
}

.newsletter-header .highlight {
  margin-top: var(--space-2);
  font-weight: var(--font-weight-6);
  color: var(--brand-color);
}

.form-wrapper {
  box-shadow: var(--shadow-3);
  border: 1px solid var(--surface-3);
  margin-inline: auto;
  padding: var(--space-6);
  border-radius: var(--radius-4);

  @media (--sm-n-below) {
    border-radius: var(--radius-0);
    border-inline: none;
    box-shadow: none;
    padding-inline: var(--space-2);
  }
}

.form {
  max-width: 35ch;
  margin-inline: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);

  @media (--sm-n-below) {
    grid-template-columns: 1fr;
  }
}

.p-form-group label {
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-1);
}

.consent-note {
  font-size: var(--font-size--1);
  line-height: var(--font-lineheight-3);
  color: var(--text-2);
  margin-bottom: var(--space-4);
}
</style>
