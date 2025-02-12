<template>
  <PageWrapper class="p-flow">
    <div class="header">
      <div class="p-flow">
        <h1>Podcast</h1>
        <p class="subtitle">
          Podcast Jedlík-nejedlík… podcast o tom, jak u dětí podporovat zdravý
          postoj k jídlu a nepodělat přitom váš vzájemný vztah s dítětem…
        </p>
        <p>Kde nás můžete poslouchat?</p>
        <p>
          <NuxtLink to="https://open.spotify.com/show/7DdV5v4nOSVHLWij5Y9a0p">
            <Icon name="logos:spotify" class="podcast-platform" />
          </NuxtLink>
        </p>
      </div>
      <NuxtLink href="https://www.forendors.cz/jedliknejedlik">
        <NuxtImg v-if="podcastLogo" :src="podcastLogo.id" alt="" class="logo" />
      </NuxtLink>
    </div>

    <h2>Bonusy pro předplatitele</h2>

    <div class="bonuses">
      <div class="bonus">
        <h3>Exkluzivní rozhovory</h3>
        <p>
          1x za měsíc pro vás děláme rozhovory se skvělými odborníky na dané
          téma
        </p>
      </div>
      <div class="bonus">
        <h3>Plná verze podcastu</h3>
        <p>
          Zajímá vás k danému tématu víc? Plnou verzi najdete na
          <NuxtLink href="https://www.forendors.cz/jedliknejedlik"
            >Forendors</NuxtLink
          >.
        </p>
      </div>
      <div class="bonus">
        <h3>Pravidelná podcast poradna</h3>
        <p>
          Každý měsíc natáčíme poradenský díl, ve kterém odpovídáme na 5 dotazů,
          které jste nám zaslali. Pokud se nějaké téma opakuje, natočíme pro vás
          zvláštní epizodu ;). Vaše dotazy nám můžete poslat prostřednictvím
          formuláře - buďte co nejkonkrétnější, ať např. víme, o jak staré dítko
          se jedná.
        </p>
      </div>
    </div>

    <PodcastQuestionForm class="form p-not-prose" />

    <h2>Kdo pro vás podcast připravuje?</h2>

    <div class="authors p-stack p-center">
      <BiographyExpert :bio="zdenka" />
      <BiographyExpert :bio="anicka" />
    </div>

    <p>
      <ContentImg v-if="podcastPhoto" :image="podcastPhoto" />
    </p>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: zdenkaPhoto } = await useDirectusImage(
  "a87fbb53-9d2b-4b0d-8bf6-89d522486979",
)

const { data: anickaPhoto } = await useDirectusImage(
  "8d621999-f37f-4568-a51d-11e65a0bde62",
)

const zdenka = {
  name: "Zdeňka Trummová",
  description:
    "Zdeňka je zakladatelkou projektu Jedlík-nejedlík, výživovou specialistkou a učitelkou, která opustila školství, aby mohla edukovat o tématech, která podporují zdraví a pohodu dětí i jejich rodičů. Potkat ji můžete i v týmech jiných organizací, jako např. STOB, protože věří v sílu spolupráce.",
  photo: zdenkaPhoto.value,
}

const anicka = {
  name: "Anna Běla Sýkorová",
  description:
    "Anička vystudovala obor Výživa a potraviny a je lektorkou a metodičkou dětských kurzů STOBu. Její hlavní pracovní náplní je koordinování, metodické vedení a lektorování programů pro školy se zaměřením na budování zdravého třídního klimatu a podporu well-beingu jednotlivce i skupiny, což dělá pod Skautským institutem.",
  photo: anickaPhoto.value,
}

const { data: podcastPhoto } = await useDirectusImage(
  "0ecb6a25-a328-430f-abdc-5606f96dd074",
)
const { data: podcastLogo } = await useDirectusImage(
  "56bd73da-334d-4564-af5d-1ed5a170a3ed",
)
</script>

<style scoped>
.logo {
  float: right;
  border-radius: var(--radius-3);
  margin-left: var(--space-7);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-6);
}

.subtitle {
  max-width: var(--size-content-2);
}

.podcast-platform {
  font-size: var(--font-size-4);
}

.authors {
  max-width: var(--measure);
}

.bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);

  .bonus {
    display: flex;
    flex-direction: column;
    gap: 1em;
    border: var(--border-1);
    padding: var(--space-4);
    border-radius: var(--radius-3);
    background-color: var(--surface-0);
    box-shadow: var(--shadow-2);
    flex-basis: var(--size-content-2);
    flex-grow: 1;
  }
}

.form {
  margin-block: var(--space-7);
}
</style>
