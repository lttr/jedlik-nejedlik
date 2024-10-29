<template>
  <PageSection class="individual p-cluster">
    <div class="column p-stack">
      <h2>Individuální poradenství</h2>
      <p class="description">
        Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam id
        dolor. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. ntum ipsum.
      </p>
      <button class="cta">Kontaktujte nás</button>
    </div>
    <div class="image-wrapper">
      <SvgoJablko class="jablko" />
      <img src="/child-placeholder.webp" alt="" />
    </div>
  </PageSection>
</template>

<script lang="ts" setup></script>

<style scoped>
.individual {
  justify-content: space-between;
  --cluster-space: var(--space-6);
  margin-bottom: var(--space-5);
}

.column {
  max-width: var(--size-header-3);
}

.cta {
  width: fit-content;
}

.image-wrapper {
  max-width: 40ch;
  display: grid;

  > * {
    grid-area: 1 / 1;
  }
}

.jablko {
  z-index: -1;
  width: 20ch;
  transform: translate(29ch, 17ch) rotate(35deg) scale(-1, 1);
}

@media (--lg-n-below) {
  .jablko {
    display: none;
  }
}
</style>
