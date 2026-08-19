<template>
  <PageWrapper>
    <AuthPanel title="Můj účet">
      <p>
        Jste přihlášeni jako <strong>{{ student?.email }}</strong
        >.
      </p>

      <form class="p-stack" @submit.prevent="onChangePassword">
        <h2 class="p-heading-4">Změna hesla</h2>

        <div class="p-form-group">
          <label for="account-password">Nové heslo</label>
          <input
            id="account-password"
            v-model="password"
            type="password"
            name="password"
            required
            autocomplete="new-password"
          />
          <p class="hint">Alespoň {{ PASSWORD_MIN_LENGTH }} znaků.</p>
        </div>

        <button type="submit" class="p-button-brand" :disabled="pending">Změnit heslo</button>

        <p v-if="confirmation" class="confirmation">{{ confirmation }}</p>
        <AuthFormError :message="errorMessage" />
      </form>

      <button type="button" class="p-button" :disabled="pending" @click="onLogOut">
        Odhlásit se
      </button>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: "auth" })

useSeoMeta({ title: "Můj účet | Jedlík-nejedlík" })

const { student } = useStudent()
const { logOut, changePassword } = useAuthActions()

const password = ref("")
const pending = ref(false)
const errorMessage = ref("")
const confirmation = ref("")

async function onChangePassword() {
  if (password.value.length < PASSWORD_MIN_LENGTH) {
    errorMessage.value = authMessages.passwordTooShort
    return
  }

  pending.value = true
  errorMessage.value = ""
  confirmation.value = ""
  try {
    confirmation.value = await changePassword(password.value)
    password.value = ""
  } catch (error) {
    errorMessage.value = authErrorMessage(error)
  } finally {
    pending.value = false
  }
}

async function onLogOut() {
  pending.value = true
  errorMessage.value = ""
  try {
    await logOut()
    await navigateTo("/")
  } catch (error) {
    errorMessage.value = authErrorMessage(error)
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.hint {
  font-size: var(--font-size--1);
  color: var(--text-2);
}

.confirmation {
  color: var(--brand-color);
}
</style>
