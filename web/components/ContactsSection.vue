<template>
  <section class="contacts-section p-full">
    <div class="card-wrapper p-page-layout">
      <ContactsCard />
    </div>
    <iframe
      loading="lazy"
      title="mapa"
      style="border: none"
      src="https://frame.mapy.cz/s/botajupuhe"
      width="100%"
      height="500"
      frameborder="0"
    ></iframe>
  </section>
</template>

<script lang="ts" setup></script>

<style scoped>
.contacts-section {
  position: relative;
  margin-top: 12rem;
}

.card-wrapper {
  position: absolute;
  top: -4em;
  width: 100%;
}

@media (--md-n-below) {
  .contacts-section {
    margin-top: var(--space-9);
  }

  .card-wrapper {
    position: static;
    margin-bottom: var(--space-6);
  }
}
</style>
