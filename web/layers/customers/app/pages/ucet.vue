<template>
  <PageWrapper>
    <h1>Můj účet</h1>

    <div v-if="user" class="p-stack">
      <p>
        Jste přihlášeni jako <strong>{{ user.email }}</strong
        >.
      </p>

      <div>
        <button type="button" class="p-button-brand" :disabled="pending" @click="onLogout">
          {{ pending ? "Odhlašujeme…" : "Odhlásit se" }}
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { user, fetch: refreshSession } = useUserSession()

const { execute, pending, errorMessage } = useAuthRequest(() =>
  $fetch("/api/auth/logout", { method: "POST" }),
)

definePageMeta({ middleware: "auth" })
useSeoMeta({ title: "Můj účet", robots: "noindex, nofollow" })

async function onLogout() {
  if (!(await execute())) return

  await refreshSession()
  await navigateTo(LOGIN_PATH)
}
</script>
