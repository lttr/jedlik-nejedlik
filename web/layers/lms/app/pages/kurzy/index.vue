<template>
  <PageWrapper class="lms-catalog">
    <header class="head">
      <div>
        <h1>{{ student ? "Moje kurzy" : "Kurzy" }}</h1>
        <p class="lead">
          {{
            student
              ? "Vyberte kurz, který chcete studovat."
              : "Prohlédněte si nabídku. Pro otevření kurzu se přihlaste."
          }}
        </p>
      </div>
    </header>

    <div class="grid">
      <LmsCourseCard v-for="course in courses" :key="course.id" :course="course" />
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
// Domovská stránka kurzů: veřejný seznam (bez lms-auth). Přihlášení se vyžaduje
// až při otevření kurzu/lekce (viz lms-auth na [course] a [lesson]).
definePageMeta({ layout: "lms" })

const { courses, student } = useLms()
</script>

<style scoped>
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

h1 {
  margin: 0;
  color: var(--brand-color);
}

.lead {
  margin: var(--space-1) 0 0;
  color: var(--text-2);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: var(--space-4);
}
</style>
