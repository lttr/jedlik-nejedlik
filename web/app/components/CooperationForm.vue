<template>
  <div class="form-wrapper">
    <form class="form" @submit.prevent="onSubmit">
      <div class="p-form-group">
        <label for="name">Jméno a příjmení *</label>
        <input id="name" type="text" name="name" required autocomplete="name" />
      </div>

      <div class="p-form-group">
        <label for="profession">Odbornost</label>
        <input id="profession" type="text" name="profession" />
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
        <label for="phone">Telefon</label>
        <input id="phone" type="tel" name="phone" autocomplete="tel" />
      </div>

      <div class="p-form-group">
        <label for="url">Webové stránky</label>
        <input id="url" type="url" name="url" autocomplete="url" />
      </div>

      <div class="p-form-group">
        <label for="cooperation"
          >V jaké oblasti byste rádi spolupracovali?</label
        >
        <input
          id="cooperation"
          type="text"
          name="cooperation"
          autocomplete="off"
        />
      </div>

      <div class="p-center">
        <button
          type="submit"
          class="p-button-brand"
          :disabled="shouldDisableSubmit"
        >
          {{ success ? "Odesláno" : "Odeslat" }}
        </button>
      </div>

      <div v-if="error" class="error-message">{{ error.message }}</div>
      <div v-if="success" class="success-message">Děkujeme!</div>
    </form>
  </div>
</template>

<script lang="ts" setup>
const { status, error, execute, data } = await useCooperationForm()

const shouldDisableSubmit = computed(() => {
  return ["pending", "success"].includes(status.value)
})

const success = computed(() => status.value === "success")

async function onSubmit(event: Event) {
  const form = event.target as HTMLFormElement
  data.value = new FormData(form)
  await execute()
  if (success.value) {
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
