<template>
  <PageSection class="about-us p-cluster">
    <div class="column p-stack">
      <h2>O nás</h2>
      <p class="description">
        Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam id
        dolor. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. ntum ipsum.
      </p>
      <button class="cta">Více o nás</button>
    </div>
    <div class="image-wrapper">
      <img src="/child-placeholder.webp" alt="" />
    </div>
    <SvgoStopka class="stopka" />
  </PageSection>
</template>

<script lang="ts" setup></script>

<style scoped>
.about-us {
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

.stopka {
  position: absolute;
  width: 6ch;
  left: -3rem;
  top: 2rem;
  stroke-width: 0.6rem;
}
</style>
