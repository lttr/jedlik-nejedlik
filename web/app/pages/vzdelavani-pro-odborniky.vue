<template>
  <PageWrapper root-element="article" class="p-prose">
    <h1>Vzdělávání pro odborníky</h1>
    <p>
      Vzdělávání nás baví a je běžnou součástí naší činnosti, ať už na straně
      řečníka nebo posluchače. Pořádáme přednášky, besedy, webináře, kurzy a
      akce na míru. Mezi odborníky šíříme zejména problematiku výživy a výchovy
      v propojení. Věříme ve spolupráci a podporu mezi odborníky, a proto jsme v
      roce 2024 přišli s novinkou &bdquo;podpůrných setkání&ldquo;. Chcete se v
      oblasti dětské výživy a výchovy s ohledem na výživu dále vzdělávat?
      Sledujte tuto sekci nebo odebírejte naše novinky pro odborníky.
    </p>

    <h2>Podpůrné setkání s intervizně-supervizními prvky</h2>
    <p>
      1x za 3 měsíce pořádáme strukturované online setkání, které má charakter
      kulatého stolu. Ve většině případů má setkání předem dané a známé téma.
    </p>
    <p>
      Chceme, abyste se na setkání cítili bezpečně, proto nejsou nahrávány.
      Účast je podmíněna odborností, zapnutou kamerou a aktivní účastí na
      setkání. Počet míst je omezen na 10 účastníků.
    </p>

    <h2>Odběr novinek pro odborníky</h2>
    <p>
      Chcete, aby vám žádné setkání neuteklo? Přihlašte se k odběru novinek pro
      odborníky.
    </p>

    <NewsletterExpertsForm class="form p-not-prose" />

    <p>
      Nejbližší kulatý stůl: 26. ledna 2025 od 18:30 hodin<br />
      Téma: Dítě a jeho emoce při nastavování hranic z pohledu rodiče <br />
      Odborníci: Domlouváme<br />
      Délka: 90 minut<br />
      Cena: 350,-<br />
    </p>

    <h2>Semináře</h2>

    <h3>Výživa a výchova v propojení - pro odborníky</h3>

    <p v-if="presentation2" class="p-popout">
      <ContentImg :image="presentation2" />
    </p>

    <p>
      Seminář je vhodný pro všechny nutriční terapeuty a výživové poradce, kteří
      ve své praxi pracují s rodiči a jejich dětmi, po domluvě možno i pro
      pedagogy mateřských škol.
    </p>

    <p class="p-base-text-bold">Co vás čeká?</p>
    <ul>
      <li>
        seznámení s konceptem výživy a výchovy v propojení a jeho
        výchovně-vzdělávacími postupy a nástroji
      </li>
      <li>zaměříme se na specifika práce s různými skupinami rodičů</li>
      <li>upozorníme na specifika práce s dětmi dle věkových kategorií</li>
      <li>
        ukážeme si rozdílnost intervenčních přístupů podle oblasti
        problematického vztahu k jídlu
      </li>
      <li>upozorníme na limity nutriční poradenské činnosti</li>
      <li>představíme možnosti mezioborové spolupráce</li>
      <li>ukázka kazuistik</li>
      <li>
        doporučení dalších relevantních zdrojů, kurzů a seminářů jiných
        organizací
      </li>
    </ul>

    <p>
      Termín: 24. května 2025<br />
      Místo: Hradec Králové <br />
      Cena: 2800,- <br />
      Čas: 9:00 - 17:00 (pauza 45 minut na oběd)<br />
      Počet účastníků: 12 <br />
      Oběd si hradí každý sám, občerstvení po celou dobu semináře zajištěno.<br />
      Akreditace v jednání
    </p>

    <h2>Kde jsme se mohli potkat?</h2>
    <p>Konference Co vše dítě živí 19. - 20. dubna 2024</p>
    <p>Konference Obezitologie a bariatrie 21. - 22. listopadu 2024</p>
    <p>Přednáška Výživa a výchova v propojení 11. září 2024</p>
    <ContentImg :image="image1" />
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: presentation2 } = await useDirectusImage(
  "48abd94b-5c30-471d-859d-a2bd43f462a1",
)
const { data: image1 } = await useDirectusImage(
  "212768cd-d1c1-4dc6-a1c8-a121a69efb2c",
)
</script>

<style scoped>
.form {
  margin-top: var(--space-6);
  margin-bottom: var(--space-8);
}
</style>
