<template>
  <PageWrapper>
    <AuthPanel title="Ověření e-mailu">
      <!-- Nothing has failed yet: either the request is still running, or the
           page has already forwarded to the login form. -->
      <p v-if="errorMessage === ''">Ověřujeme váš e-mail…</p>

      <template v-else>
        <AuthFormError :message="errorMessage" />
        <p>
          Pokud jste registraci už dokončili, zkuste se rovnou
          <NuxtLink to="/prihlaseni">přihlásit</NuxtLink>. Jestli přihlášení neprojde,
          <NuxtLink to="/registrace">zaregistrujte se znovu</NuxtLink> — přijde vám nový ověřovací
          e-mail.
        </p>
      </template>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
useHead({ title: "Ověření e-mailu" })

const { verifyEmail } = useAuthActions()
const { errorMessage, submit } = useAuthForm()

const { token, scrubbed } = useEmailedToken()

onMounted(async () => {
  // Only once the token is out of the address bar.
  await scrubbed

  await submit(async () => {
    // A missing token is posted like any other: the route is the single judge
    // of whether a token activates an account, and answers both the same way.
    await verifyEmail(token)
    await navigateTo(
      { path: "/prihlaseni", query: { [EMAIL_VERIFIED_QUERY]: "1" } },
      { replace: true },
    )
  })
})
</script>
