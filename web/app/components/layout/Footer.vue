<template>
  <footer class="footer">
    <div class="p-switcher">
      <section>
        <SiteLogo class="logo" />
        <p class="contact p-secondary-text-regular">
          Kontakt:<br />
          <a class="link" href="mailto:info@jedlik-nejedlik.cz"
            >info@jedlik-nejedlik.cz</a
          ><br />
          <a class="link" href="tel:732651959">732 651 959</a><br />
        </p>
      </section>
      <section class="p-stack">
        <ul class="unstyled p-stack">
          <li><NuxtLink class="link" to="/o-nas">O nás</NuxtLink></li>
          <li><NuxtLink class="link" to="/pro-rodice">Pro rodiče</NuxtLink></li>
          <li><NuxtLink class="link" to="/podcast">Podcast</NuxtLink></li>
          <li>
            <NuxtLink class="link" to="/pro-odborniky">Pro odborníky</NuxtLink>
          </li>
          <li><NuxtLink class="link" to="/kontakt">Kontakt</NuxtLink></li>
        </ul>
      </section>
      <section class="p-stack">
        <ul class="unstyled p-stack">
          <li>
            <NuxtLink class="link" to="/obchodni-podminky"
              >Obchodní podmínky</NuxtLink
            >
          </li>
          <li>
            <NuxtLink class="link" to="/zasady-zpracovani-osobnich-udaju"
              >Zásady zpracování osobních údajů</NuxtLink
            >
          </li>
        </ul>
      </section>
      <section class="social-links">
        Sledujte nás
        <SocialLinks class="p-heading-3" />
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
  line-height: var(--font-lineheight-2);
}

.contact {
  margin-top: var(--space-4);
  line-height: var(--font-lineheight-4);
}

.social-links {
  line-height: var(--font-lineheight-4);
}

.p-stack {
  --stack-space: var(--space-2);
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
