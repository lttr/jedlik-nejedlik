<template>
  <PageWrapper>
    <AuthPanel title="Můj účet">
      <p>
        Jste přihlášeni jako <strong>{{ student?.email }}</strong>
      </p>

      <button type="button" class="p-button" :disabled="pending" @click="onLogOut">
        Odhlásit se
      </button>

      <AuthFormError :message="errorMessage" />
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: "auth" })

useHead({ title: "Můj účet" })

const { student } = useStudent()
const { logOut } = useAuthActions()
const { pending, errorMessage, submit } = useAuthForm()

async function onLogOut() {
  await submit(async () => {
    await logOut()
    await navigateTo("/")
  })
}
</script>
