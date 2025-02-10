<template>
  <div class="form-wrapper">
    <form class="form" @submit.prevent="onSubmit">
      <div class="p-form-group">
        <label for="name">Jméno a příjmení *</label>
        <input id="name" type="text" name="name" required autocomplete="name" />
      </div>

      <div class="p-form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autocomplete="email"
        />
      </div>

      <div class="p-form-group">
        <label for="profession">Odbornost</label>
        <input id="profession" type="text" name="profession" />
      </div>

      <div class="p-form-group">
        <label for="note">Máte námět na téma pro kulatý stůl?</label>
        <p class="p-secondary-text-regular">
          Pokud je nějaké téma, které by vás zajímalo na kulatém stole otevřít,
          napište jej zde. Zvážíme jeho zařazení do harmonogramu.
        </p>
        <textarea id="note" name="note" rows="3"></textarea>
      </div>

      <div class="p-center">
        <button
          type="submit"
          class="p-button-brand"
          :disabled="isPendingOrSuccess"
        >
          {{ isSuccess ? "Odesláno" : "Přihlásit k odběru" }}
        </button>
      </div>

      <div v-if="error" class="error-message">{{ error.message }}</div>
      <div v-if="isSuccess" class="success-message">
        Děkujeme za přihlášení k odběru!
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
const { execute, error, isSuccess, isPendingOrSuccess } =
  useNewsletterExpertsForm()

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

form {
  max-width: 30ch;
  margin-inline: auto;
}
</style>
