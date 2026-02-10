<template>
  <div class="form-wrapper">
    <form class="form" @submit.prevent="onSubmit">
      <div class="p-form-group">
        <label for="webinar-email">Váš e-mail *</label>
        <input
          id="webinar-email"
          type="email"
          name="email"
          required
          autocomplete="email"
          placeholder="vas@email.cz"
        />
      </div>

      <div class="p-form-group">
        <label for="webinar-question"
          >Na co bych se chtěl/a na webináři zeptat?</label
        >
        <textarea
          id="webinar-question"
          name="question"
          rows="3"
          placeholder="Napište svůj dotaz..."
        ></textarea>
      </div>

      <p class="consent-note">
        Odesláním formuláře se přihlašujete k odběru novinek od Jedlík-nejedlík.
        Souhlas můžete kdykoli odvolat prostřednictvím odhlašovacího odkazu v
        každé zprávě.
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
          {{ isSuccess ? "Přihlášeno" : "Přihlásit se na webinář" }}
        </button>
      </div>

      <div v-if="error" class="error-message">{{ error.message }}</div>
      <div v-if="isSuccess" class="success-message">
        Děkujeme za přihlášení! Těšíme se na vás 9. března v 19:00.
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
const { execute, error, isSuccess, isPendingOrSuccess } = useWebinarSignupForm()

async function onSubmit(event: Event) {
  const form = event.target as HTMLFormElement
  await execute(new FormData(form))
  if (isSuccess.value) {
    form.reset()
  }
}
</script>

<style scoped>
.form-wrapper {
  max-width: var(--size-content-2);
  box-shadow: var(--shadow-4);
  border: var(--border-3);
  margin-inline: auto;
  padding: var(--space-6);
  border-radius: var(--radius-3);
  background: var(--surface-1);

  @media (--sm-n-below) {
    border-radius: var(--radius-2);
    padding: var(--space-4);
  }
}

form {
  max-width: 40ch;
  margin-inline: auto;
}

.p-form-group label {
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-1);
}

textarea {
  width: 100%;
  resize: vertical;
}

.consent-note {
  font-size: var(--font-size--1);
  line-height: var(--font-lineheight-3);
  color: var(--text-2);
  margin-bottom: var(--space-4);
}

.success-message,
.error-message {
  margin-top: var(--space-3);
}
</style>
