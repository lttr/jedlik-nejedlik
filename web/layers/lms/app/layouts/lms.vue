<template>
  <div class="lms-shell">
    <header class="lms-bar">
      <div class="lms-bar-inner p-page-layout">
        <NuxtLink to="/kurzy" class="brand">
          <span class="brand-mark">JN</span>
          <span class="brand-text">Kurzy</span>
        </NuxtLink>

        <div class="lms-bar-right">
          <NuxtLink to="/" class="to-site">Zpět na web →</NuxtLink>
          <span v-if="student" class="who">
            <span class="who-email">{{ student }}</span>
            <button class="logout" type="button" @click="onLogout">Odhlásit</button>
          </span>
          <NuxtLink v-else to="/kurzy/vstup" class="login">Přihlásit se</NuxtLink>
        </div>
      </div>
    </header>

    <main>
      <slot></slot>
    </main>
  </div>
</template>

<script lang="ts" setup>
const { student, logout } = useLms()

function onLogout() {
  logout()
  navigateTo("/kurzy/vstup")
}

// LMS je samostatná aplikace uvnitř webu — vlastní layout, ne marketingová hlavička.
useHead({
  htmlAttrs: {
    class: "is-light",
  },
})
</script>

<style scoped>
.lms-shell {
  min-height: 100vh;
  background: var(--surface-2, #f3f1ea);
}

.lms-bar {
  background: var(--brand-color);
  color: white;
}

.lms-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block: var(--space-3);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: white;
  text-decoration: none;
  font-weight: var(--font-weight-7);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-2);
  background: rgb(255 255 255 / 0.16);
  font-size: var(--font-size--1);
}

.brand-text {
  font-size: var(--font-size-1);
}

.lms-bar-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--font-size--1);
  flex-wrap: wrap;
}

.to-site {
  color: white;
  text-decoration: none;
  opacity: 0.85;
}

.to-site:hover {
  opacity: 1;
  text-decoration: underline;
}

.who {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}

.who-email {
  opacity: 0.85;
}

.logout {
  background: none;
  border: 1px solid rgb(255 255 255 / 0.4);
  border-radius: var(--radius-2);
  color: white;
  cursor: pointer;
  font: inherit;
  padding: var(--space-1) var(--space-3);
}

.logout:hover {
  background: rgb(255 255 255 / 0.14);
}

.login {
  color: var(--brand-color);
  background: white;
  border-radius: var(--radius-2);
  padding: var(--space-1) var(--space-3);
  text-decoration: none;
  font-weight: var(--font-weight-6);
}

.login:hover {
  opacity: 0.9;
}

main {
  padding-block: var(--space-6);
}
</style>
