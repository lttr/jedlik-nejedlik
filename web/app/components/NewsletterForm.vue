<template>
  <div class="newsletter-section">
    <div class="newsletter-header">
      <h3>Newsletter pro rodiče</h3>
      <p>
        Nechte si posílat ty nejlepší tipy, novinky a inspiraci ze světa dětské
        výživy přímo do své e-mailové schránky.
      </p>
      <p class="highlight">S naším newsletterem vám nic neunikne.</p>
    </div>

    <div class="form-wrapper">
      <form class="form" @submit.prevent="onSubmit">
        <div class="form-row">
          <div class="p-form-group">
            <label for="newsletter-firstname">Křestní jméno</label>
            <input
              id="newsletter-firstname"
              v-model="firstName"
              type="text"
              name="firstname"
              autocomplete="given-name"
            />
          </div>

          <div class="p-form-group">
            <label for="newsletter-lastname">Příjmení</label>
            <input
              id="newsletter-lastname"
              v-model="lastName"
              type="text"
              name="lastname"
              autocomplete="family-name"
            />
          </div>
        </div>

        <div class="p-form-group">
          <label for="newsletter-email">E-mailová adresa *</label>
          <input
            id="newsletter-email"
            v-model="email"
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
          <button type="submit" class="p-button-brand">Odebírat novinky</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()
const firstName = ref("")
const lastName = ref("")
const email = ref("")

async function onSubmit() {
  // TODO: Implement newsletter subscription backend
  console.log("Newsletter subscription:", {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
  })
  router.push("/dekujeme-za-zajem-o-newsletter")
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
