<template>
  <footer class="footer">
    <div class="p-switcher">
      <section class="p-stack">
        <SiteLogo class="logo" />
        <p>123 456 789</p>
      </section>
      <section class="p-stack">
        <ul class="unstyled">
          <li><NuxtLink class="link" to="/o-nas">O nás</NuxtLink></li>
          <li><NuxtLink class="link" to="/pro-rodice">Pro rodiče</NuxtLink></li>
          <li><NuxtLink class="link" to="/akce">Akce</NuxtLink></li>
          <li>
            <NuxtLink class="link" to="/pro-odborniky">Pro odborníky</NuxtLink>
          </li>
          <li><NuxtLink class="link" to="/kontakt">Kontakt</NuxtLink></li>
        </ul>
      </section>
      <section class="p-stack">
        <SocialLinks />
      </section>
    </div>
  </footer>
</template>

<script lang="ts" setup></script>

<style scoped>
.footer {
  color: var(--text-color-1-inverse);
  background-color: var(--color-midnight);
  padding-block: var(--space-9);
}

.link {
  font-size: var(--font-size--1);
  text-decoration: none;
  color: var(--text-color-1-inverse);

  &:hover {
    text-decoration: underline;
  }
}

.logo {
  color: var(--color-pale-blue);
}

.unstyled {
  list-style-type: none;
  padding-inline: 0;

  li {
    padding-inline: 0;
  }
}
</style>
