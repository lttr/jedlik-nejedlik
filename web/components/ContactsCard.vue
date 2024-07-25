<template>
  <div class="contacts-card p-stack">
    <h3>Jedlík nejedlík</h3>
    <section class="p-flow">
      <div>
        <h4 class="subheading">Poradna</h4>
        <div>
          Velká 22<br />
          Praha 10<br />
          Česká republika
        </div>
      </div>
      <div>
        <h4 class="subheading">telefon</h4>
        <a href="">+420 123 456 789</a>
      </div>
      <div>
        <h4 class="subheading">email</h4>
        <a href="">info@jedlik-nejedlik-cz</a>
      </div>
    </section>
    <button class="p-button">Kontaktovat</button>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.contacts-card {
  padding-block: var(--space-6);
  padding-inline: var(--space-5);
  max-width: var(--size-content-2);
  border-radius: var(--radius-4);
  box-shadow: var(--shadow-4);
  background: var(--bg-color-body);
  font-size: var(--font-size--1);

  h3 {
    font-size: var(--font-size-1);
  }

  .subheading {
    margin-bottom: var(--space-1);
    font-size: var(--font-size--2);
    font-weight: var(--font-weight-6);
  }

  button {
    width: fit-content;
  }
}
</style>
