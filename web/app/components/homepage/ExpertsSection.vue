<template>
  <PageSection class="experts">
    <SvgoSpirala class="spirala" />
    <div class="wrapper p-switcher">
      <h2 class="heading">Pro odborníky</h2>
      <p class="description p-secondary-text-regular">
        Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam id
        dolor. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. ntum ipsum.
      </p>
      <button class="cta">Více informací</button>
    </div>
  </PageSection>
</template>

<script lang="ts" setup></script>

<style scoped>
.experts {
  background-color: var(--color-dull-blue);
}

.wrapper {
  align-items: center;
  --cluster-space: var(--space-7);
  --switcher-treshold: 38ch;
}

.heading {
  max-width: none;
}

.description {
  min-width: var(--size-content-1);
}

.cta {
  max-width: fit-content;
}

.spirala {
  position: absolute;
  transform: rotate(-16deg) translate(6ch, -7ex) scale(1, -1);
  width: 8ch;
  stroke-width: 0.5rem;
}
</style>
