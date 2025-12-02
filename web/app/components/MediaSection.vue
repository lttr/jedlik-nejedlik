<template>
  <section class="media-section p-flow">
    <div class="media-header">
      <h2>Mediální výstupy</h2>
      <div class="media-badges">
        <span>ČT24</span>
        <span>iDNES</span>
        <span>Český rozhlas</span>
        <span>Lifestyle</span>
      </div>
    </div>

    <div v-if="media1" class="media-visual">
      <ContentImg
        :image="media1"
        alt="Vizuální mediální výstupy Jedlík-nejedlík"
      />
    </div>

    <div class="media-list">
      <div class="media-item">
        <div class="media-item-content">
          <h3>iDNES – Rozstřel</h3>
          <p>Proč děti přibírají - rozhovor lékaře doplněný osobním příběhem</p>
        </div>
        <a
          href="https://tv.idnes.cz/rozstrel/rozstrel-jan-bozensky-a-zdenka-trummova-cely-zaznam.V240304_173616_idnestv_krr"
          target="_blank"
          rel="noopener"
          >Přehrát</a
        >
      </div>
    </div>

    <div v-if="media2" class="media-visual">
      <ContentImg
        :image="media2"
        alt="Vizuální mediální výstupy Jedlík-nejedlík"
      />
    </div>

    <div class="media-list">
      <div class="media-item">
        <div class="media-item-content">
          <h3>iDNES – článek</h3>
          <p>Příběh, osobní zkušenost, práce s rodiči a školami</p>
        </div>
        <a
          href="https://www.idnes.cz/hradec-kralove/zpravy/zdenka-trummova-vyziva-poradkyne-obezita-deti-jidlo-rodice.A241217_160035_hradec-zpravy_tuu"
          target="_blank"
          rel="noopener"
          >Číst</a
        >
      </div>
    </div>

    <div v-if="media3" class="media-visual">
      <ContentImg
        :image="media3"
        alt="Vizuální mediální výstupy Jedlík-nejedlík"
      />
    </div>

    <div class="media-list">
      <div class="media-item">
        <div class="media-item-content">
          <h3>Česká televize – Věda 24</h3>
          <p>Odborný pohled na dětskou obezitu a prevenci</p>
        </div>
        <a
          href="https://www.ceskatelevize.cz/porady/11633975240-veda-24/224411058340010/cast/1032674/"
          target="_blank"
          rel="noopener"
          >Přehrát</a
        >
      </div>

      <div class="media-item">
        <div class="media-item-content">
          <h3>ČT24 – Události komentáře</h3>
          <p>Kontext k filmu „Život k sežrání" a dětská obezita v ČR</p>
        </div>
        <a
          href="https://ct24.ceskatelevize.cz/clanek/kultura/uspesny-film-zivot-k-sezrani-vypravi-o-detske-obezite-354127"
          target="_blank"
          rel="noopener"
          >Číst</a
        >
      </div>

      <div class="media-item">
        <div class="media-item-content">
          <h3>Český rozhlas – Na nedělní vlně</h3>
          <p>Vlastní zkušenost s obezitou a práce s rodinami</p>
        </div>
        <a
          href="https://www.mujrozhlas.cz/na-nedelni-vlne-hradce-kralove/zdenka-trummova-se-v-mladi-hodne-prala-s-obezitou-ted-sama-pomaha"
          target="_blank"
          rel="noopener"
          >Poslechnout</a
        >
      </div>

      <div class="media-item">
        <div class="media-item-content">
          <h3>Časopis Lifestyle</h3>
          <p>Jak výživa souvisí s výchovou a dynamikou v rodině</p>
        </div>
        <a
          href="https://www.info-lifestyle.cz/rodinny-pruvodce/zdenka-trummova-zdrava-vyziva-souvisi-s-vychovou"
          target="_blank"
          rel="noopener"
          >Číst</a
        >
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
const { data: media1 } = await useDirectusImage(
  "a2842731-4919-4631-baa7-dd90ad521912",
)

const { data: media2 } = await useDirectusImage(
  "aa119fda-080e-4ed9-90dc-f58939299541",
)

const { data: media3 } = await useDirectusImage(
  "3c7f383a-cd78-43f8-8805-c09754b7f9ae",
)
</script>

<style scoped>
.media-section {
  margin-block: var(--space-7);
}

.media-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  margin-block-end: var(--space-4);
}

.media-header h2 {
  margin-block: 0;
}

.media-visual {
  margin-block: var(--space-5);
}

.media-badges {
  display: flex;
  flex-wrap: wrap;
  font-weight: var(--font-weight-6);
  line-height: var(--font-lineheight-1);

  > :not(:last-child) {
    border-right: 2px solid var(--color-navy);
    margin-right: var(--space-3);
    padding-right: var(--space-3);
  }
}

.media-list {
  display: grid;
  gap: 0;
}

.media-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--space-3);
  padding-block: var(--space-3);
  padding-inline: var(--space-3);
  border-block-end: 1px solid
    color-mix(in srgb, var(--color-navy) 15%, transparent);
}

.media-item:first-child {
  border-block-start: 1px solid
    color-mix(in srgb, var(--color-navy) 15%, transparent);
}

.media-item-content {
  min-width: 0;
}

.media-item h3 {
  margin-block: 0;
  font-size: var(--font-size-1);
  font-weight: 500;
}

.media-item p {
  margin-block: 0;
  font-size: var(--font-size-0);
  opacity: 0.6;
}

.media-item a {
  font-size: var(--font-size-0);
  font-weight: 500;
  white-space: nowrap;
}
</style>
