<template>
  <nav class="main-nav p-page-layout">
    <div class="nav-wrapper">
      <NuxtLink class="link" to="/"><SiteLogo /></NuxtLink>

      <ul class="links p-cluster">
        <li>
          <NuxtLink class="link" to="/seminare">Semináře</NuxtLink>
        </li>
        <li>
          <NuxtLink class="link" to="/poradenstvi"
            >Individuální poradenství</NuxtLink
          >
        </li>
        <li>
          <NuxtLink class="link" to="/odbornici">Pro odborníky</NuxtLink>
        </li>
        <li>
          <NuxtLink class="link" to="/blog">Blog</NuxtLink>
        </li>
        <li>
          <NuxtLink class="link" to="/o-nas">O nás</NuxtLink>
        </li>
        <li>
          <NuxtLink class="link" to="/kontakt">Kontakt</NuxtLink>
        </li>
        <li>
          <NuxtLink class="link" to="/faq">FAQ</NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

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
}

.link {
  color: var(--brand-color);
  text-decoration: none;
}
</style>
