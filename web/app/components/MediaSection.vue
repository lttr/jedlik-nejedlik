<template>
  <section class="media-section p-flow">
    <h2>Mediální výstupy</h2>
    <div class="media-badges">
      <span class="media-badge">ČT24</span>
      <span class="media-badge">iDNES</span>
      <span class="media-badge">Český rozhlas</span>
      <span class="media-badge">Lifestyle</span>
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
          <h3>iDNES – Rozstřel</h3>
          <p>Proč děti přibírají a jak nastavovat hranice bez stresu</p>
        </div>
        <a
          href="https://tv.idnes.cz/rozstrel/rozstrel-jan-bozensky-a-zdenka-trummova-cely-zaznam.V240304_173616_idnestv_krr"
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

<style scoped>
.media-section {
  margin-block: var(--space-7);
}

.media-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-block-end: var(--space-4);
}

.media-badges > span {
  display: inline-flex !important;
  align-items: center;
  margin-block: 0 !important;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-navy);
  border-radius: 100px;
  font-size: var(--font-size-0);
  line-height: 1;
  color: var(--color-navy);
  white-space: nowrap;
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
