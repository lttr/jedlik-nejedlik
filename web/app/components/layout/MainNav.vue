<template>
  <nav class="main-nav p-page-layout">
    <div class="nav-wrapper">
      <NuxtLink class="link" to="/" aria-label="Home">
        <SiteLogo />
      </NuxtLink>

      <ul class="links p-cluster">
        <li>
          <NuxtLink class="link" to="/o-nas">O nás</NuxtLink>
        </li>
        <li>
          <NuxtLink class="link" to="/pro-rodice">Pro rodiče</NuxtLink>
        </li>
        <li>
          <NuxtLink class="link" to="/pro-odborniky">Pro odborníky</NuxtLink>
        </li>
        <li>
          <NuxtLink class="link" to="/podcast">Podcast</NuxtLink>
        </li>
        <li>
          <NuxtLink class="link" to="/kontakt">Kontakt</NuxtLink>
        </li>
        <li v-if="coursesPublic">
          <NuxtLink class="link" to="/kurzy">Kurzy</NuxtLink>
        </li>
        <li v-if="loggedIn">
          <NuxtLink class="link" to="/muj-ucet">Můj účet</NuxtLink>
        </li>
        <li v-else-if="coursesPublic">
          <NuxtLink class="link" to="/prihlaseni">Přihlásit se</NuxtLink>
        </li>
        <li>
          <NuxtLink class="featured" :to="featuredTarget">
            <Icon name="bi:star" aria-hidden="true" />
            Cukroví s dětmi
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import SiteLogo from "./SiteLogo.vue"
import { useAccount } from "#layers/auth/app/composables/account"

const { loggedIn } = useAccount()

const { coursesPublic } = useRuntimeConfig().public

// The season's featured offer. Swap or remove it once the Christmas e-book
// stops selling.
const FEATURED_PATH = "/ebook-vanocni-cukrovi"
const route = useRoute()
const featuredTarget = computed(() =>
  route.path === FEATURED_PATH ? { hash: "#koupit" } : FEATURED_PATH,
)
</script>

<style scoped>
.main-nav {
  background-color: var(--color-peach);
  padding-block: var(--space-6);

  .nav-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);

    @media (--md-n-below) {
      flex-direction: column;
    }
  }
}

.links {
  --cluster-space: var(--space-1);
  list-style-type: none;
  padding-inline-start: 0;

  .link {
    display: flex;
    font-size: var(--font-size--1);
    padding-inline: var(--space-3);

    &:hover {
      background-color: var(--color-pale-blue);
      border-radius: var(--radius-default);
    }
  }

  .link.router-link-exact-active {
    background-color: color-mix(in srgb, var(--color-pale-blue) 45%, transparent);
    border-radius: var(--radius-default);
  }
}

.link {
  color: var(--brand-color);
  text-decoration: none;
}

.featured {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  min-height: 2.75rem;
  margin-inline-start: var(--space-2);
  padding-inline: var(--space-4);
  border-radius: var(--radius-round);
  background-color: var(--color-brick-red);
  color: white;
  font-size: 0.875rem;
  font-weight: var(--font-weight-6);
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background-color: var(--color-brick-red-dark);
  }

  &.router-link-active {
    box-shadow:
      0 0 0 3px var(--color-peach),
      0 0 0 5px var(--color-brick-red);
  }
}
</style>
