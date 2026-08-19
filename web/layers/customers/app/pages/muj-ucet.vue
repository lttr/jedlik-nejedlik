<template>
  <PageWrapper>
    <AuthPanel title="Můj účet">
      <p>
        Jste přihlášeni jako <strong>{{ student?.email }}</strong
        >.
      </p>

      <button type="button" class="p-button-brand" :disabled="pending" @click="onLogOut">
        Odhlásit se
      </button>

      <AuthFormError :message="errorMessage" />
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: "auth" })

useSeoMeta({ title: "Můj účet | Jedlík-nejedlík" })

const { student } = useStudent()
const { logOut } = useAuthActions()

const pending = ref(false)
const errorMessage = ref("")

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
