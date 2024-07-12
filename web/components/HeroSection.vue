<template>
  <section class="hero p-switcher p-container">
    <div>
      <h1>Aby každé jídlo bylo radost</h1>
      <p class="subheading">
        Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam id
        dolor. Ut enim ad minim veniam, quis nostrud exercitation.
      </p>
    </div>
    <div class="ilustrations">
      <SvgoBoruvky class="boruvky" />
      <SvgoHruska class="hruska" />
      <SvgoJablko class="jablko" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  --switcher-treshold: 90ch;
  margin-top: var(--space-9);
  width: 100%;
}

.subheading {
  margin-top: var(--space-6);
  max-width: var(--size-content-2);
}

.ilustrations {
  display: grid;
  height: 30rem;
  margin-block: var(--space-2-3);

  > * {
    grid-area: 1 / 1;
  }

  @media (--md-n-below) {
    height: auto;
    display: flex;
    justify-content: start;
    gap: var(--space-6);

    > * {
      grid-area: initial;
    }
  }
}

.boruvky {
  width: 9rem;
  transform: translate(1rem, 2rem);

  @media (--md-n-below) {
    width: auto;
    max-width: 6rem;
    transform: rotate(-15deg);
  }
}

.hruska {
  width: 12rem;
  transform: translate(16rem, -5rem) rotate(-33deg);

  @media (--md-n-below) {
    width: auto;
    max-width: 8rem;
    transform: rotate(-15deg);
  }
}

.jablko {
  width: 16rem;
  transform: translate(4rem, 12rem) rotate(-15deg);

  @media (--md-n-below) {
    width: auto;
    max-width: 8rem;
    transform: rotate(-15deg);
  }
}
</style>
