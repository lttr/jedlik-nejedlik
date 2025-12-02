<template>
  <div class="form-wrapper">
    <form class="form" @submit.prevent="onSubmit">
      <div class="p-form-group">
        <label for="email">Váš e-mail *</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autocomplete="email"
          placeholder="vas@email.cz"
        />
      </div>

      <div class="p-center">
        <button
          type="submit"
          class="p-button-brand"
          :disabled="isPendingOrSuccess"
        >
          {{ isSuccess ? "Odesláno" : "Přihlásit se na čekací listinu" }}
        </button>
      </div>

      <div v-if="error" class="error-message">{{ error.message }}</div>
      <div v-if="isSuccess" class="success-message">
        Děkujeme! Budeme vás informovat, až se kurz otevře.
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
const { execute, error, isSuccess, isPendingOrSuccess } =
  useWaitlistObesityCourseForm()

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
  max-width: 35ch;
  margin-inline: auto;
}

.p-form-group label {
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-1);
}

.success-message,
.error-message {
  margin-top: var(--space-3);
}
</style>
