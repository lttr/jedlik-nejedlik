<template>
  <PageWrapper class="lms-entry">
    <div class="entry-card">
      <h1>Přihlášení do kurzů</h1>
      <p class="lead">Vstup do vzdělávací platformy Jedlík-nejedlík</p>

      <!-- Záměrně BEZ <form>/type="submit": nativní odeslání formuláře se spustí
           i před hydratací (rychlý klik) a přesměruje zpět na /kurzy/vstup. Prostý
           button + @click nikdy nespustí nativní navigaci; před hydratací je klik
           neškodný no-op, po hydrataci zavolá handler. Enter odesílá přes @keyup. -->
      <div class="fields" @keyup.enter="submit">
        <label class="field">
          <span>E-mail</span>
          <input v-model="email" type="email" autocomplete="username" required />
        </label>
        <label class="field">
          <span>Heslo</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>
        <button class="p-button p-button-brand" type="button" @click="submit">Přihlásit se</button>
      </div>

      <p class="note">
        Prototyp — jakékoli údaje projdou. Model účet-první (O-17), identitou je e-mail.
      </p>
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
definePageMeta({ layout: "lms" })

const { login } = useLms()
const route = useRoute()

const email = ref("rodic@example.cz")
const password = ref("heslo123")

function submit() {
  login(email.value)
  const redirect = (route.query.redirect as string) || "/kurzy"
  navigateTo(redirect)
}
</script>

<style scoped>
.lms-entry {
  display: grid;
  place-items: center;
  padding-block: var(--space-6);
}

.entry-card {
  width: min(28rem, 100%);
  background: var(--surface-1, white);
  border: 1px solid var(--color-peach);
  border-radius: var(--radius-4);
  padding: var(--space-6);
  text-align: center;
}

h1 {
  margin: 0;
  font-size: var(--font-size-3);
  color: var(--brand-color);
}

.lead {
  color: var(--text-2);
  margin-block: var(--space-2) var(--space-5);
}

.fields {
  display: grid;
  gap: var(--space-4);
  text-align: start;
}

.field span {
  display: block;
  font-size: var(--font-size--1);
  color: var(--text-2);
  margin-bottom: var(--space-1);
}

.note {
  font-size: var(--font-size--1);
  color: var(--text-2);
  margin-top: var(--space-5);
  margin-bottom: 0;
}
</style>
