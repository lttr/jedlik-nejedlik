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

const route = useRoute()
const { verifyEmail } = useAuthActions()
const { errorMessage, submit } = useAuthForm()

// Captured before the token is stripped from the URL below.
const token = String(route.query.token ?? "")

onMounted(async () => {
  // Get the token out of the address bar before anything else: it must not
  // survive in the history entry, in a referrer, or in a bookmark. Router
  // replacement is `history.replaceState` with the router kept in step.
  await navigateTo({ path: VERIFY_EMAIL_PATH, query: {} }, { replace: true })

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
