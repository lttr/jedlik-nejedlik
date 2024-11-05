<template>
  <PageSection class="lectures">
    <SvgoSpirala class="spirala" />
    <div class="wrapper">
      <div class="column p-stack">
        <h2>Semináře a&nbsp;přednášky</h2>
        <p class="description">
          Vzdělávání nás baví, a proto pořádáme přednášky, besedy, webináře,
          kurzy a akce na míru.
        </p>
        <button class="cta">Všechny semináře</button>
      </div>
      <div class="events-wrapper">
        <div class="events">
          <LectureCard class="event" v-bind="exampleCard" heading-level="h2" />
          <LectureCard class="event" v-bind="exampleCard" heading-level="h2" />
        </div>
      </div>
    </div>
    <SvgoStopka class="stopka" />
  </PageSection>
</template>

<script lang="ts" setup>
const exampleCard: Card = {
  id: 1,
  image: "/child-placeholder.webp",
  to: "/",
  tags: [
    { text: "jedlík", to: "/" },
    { text: "nejedlík", to: "/" },
  ],
  title: "Jedlík nejedlík",
  text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam id dolor. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Aliquam erat volutpat.",
}
</script>

<style scoped>
.lectures {
  background-color: var(--color-light-lime);
  margin-bottom: 12rem;
}

.wrapper {
  display: flex;
  align-items: start;
  gap: var(--space-6);
}

.cta {
  margin-top: var(--space-9);
  width: fit-content;
}

.column {
  max-width: var(--size-header-3);
}

.spirala {
  position: absolute;
  transform: rotate(180deg) translateY(6ex) translateX(3rem);
  width: 8ch;
  stroke-width: 0.6rem;
}

.stopka {
  position: absolute;
  width: 6ch;
  transform: translate(26rem, 12rem);
  stroke-width: 0.6rem;
}

.events-wrapper {
  width: 100%;
  position: relative;
}

.events {
  z-index: 1;
  display: flex;
  align-items: start;
  gap: var(--space-4);
  position: absolute;
  overflow-x: scroll;
  width: 100%;
  padding: var(--space-5);
  padding-left: 0;

  .event {
    min-width: var(--size-header-2);
  }
}

@media (--lg-n-below) {
  .lectures {
    margin-bottom: 0;
  }

  .wrapper {
    flex-direction: column;
  }

  .cta {
    margin-top: var(--space-7);
  }

  .events {
    position: static;
  }

  .stopka {
    display: none;
  }
}
</style>
