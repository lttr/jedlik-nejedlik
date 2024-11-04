<template>
  <form class="form p-center">
    <p>
      <label for="name">Jméno *</label><br />
      <input id="name" type="text" name="name" required autocomplete="name" />
    </p>

    <p>
      <label for="email">Email *</label><br />
      <input
        id="email"
        type="email"
        name="email"
        required
        autocomplete="email"
      />
    </p>

    <p>
      <label for="phone">Telefon</label><br />
      <input id="phone" type="tel" name="phone" autocomplete="tel" />
    </p>

    <p>
      <label for="cooperation"
        >V jaké oblasti byste rádi spolupracovali? *</label
      ><br />
      <input
        id="cooperation"
        type="text"
        name="cooperation"
        required
        autocomplete="off"
      />
    </p>

    <p class="p-center">
      <button type="submit">Odeslat</button>
    </p>
  </form>
</template>

<script lang="ts" setup></script>

<style scoped>
.form {
  width: fit-content;
  margin-block: var(--space-6);
  padding-block: var(--space-6);
  padding-inline: var(--space-6);
  border-radius: var(--radius-4);

  box-shadow: var(--shadow-3);
  border: 1px solid var(--surface-3);
}

input {
  width: 100%;
}
</style>
