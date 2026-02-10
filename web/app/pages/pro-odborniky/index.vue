<template>
  <PageWrapper root-element="article" class="p-prose">
    <h1>Výživa a&nbsp;výchova v&nbsp;propojení</h1>

    <p class="p-base-text-bold">
      Milí odborníci, vítejte na stránkách projektu Jedlík-nejedlík.
    </p>

    <p>
      Věříme, že prevence je základním krokem pro eliminaci nárůstu dětské
      nadváhy a&nbsp;obezity na jedné straně a&nbsp;poruch příjmu potravy na
      straně druhé.
    </p>

    <p>
      Proto přicházíme s&nbsp;konceptem výživy a&nbsp;výchovy v&nbsp;propojení
      jako nástrojem prevence, který si klade za cíl připravit rodiče na
      výchovné situace okolo jídla tak, aby je zvládnul. Rodič, který ustojí
      dětská <i>&bdquo;blééé, fuj, nechci apod.&ldquo;</i>, nerezignuje při
      prvním nezdaru na výživová doporučení a&nbsp;bude schopen podporovat
      zdravý životní styl u&nbsp;svých dětí dlouhodobě.
    </p>

    <div class="p-flow">
      <h2 class="p-base-text-bold">Naše cíle jsou:</h2>
      <ul>
        <li>
          poskytovat rodičům odborné a&nbsp;profesně provázané poradenství
          k&nbsp;tématům nejedlictví, nadváhy, obezity a&nbsp;zdravého životního
          stylu u&nbsp;dětí i&nbsp;rodiny jako celku
        </li>
        <li>
          vytvářet prostor pro prezentaci odborníků a&nbsp;odborných pracovišť,
          které poskytují poradenství ve výše uvedených oblastech
        </li>
        <li>
          otevírat prostor pro spolupráci odborníků, kteří chtějí táhnout
          v&nbsp;uvedených oblastech za jeden provaz
        </li>
        <li>
          poskytovat odborníkům možnost dalšího vzdělávání
          v&nbsp;pedagogicko-psychologických tématech v&nbsp;kontextu výživy
        </li>
        <li>umožňovat pravidelná intervizní setkání</li>
      </ul>
    </div>

    <nav class="topic-nav p-not-prose">
      <NuxtLink to="/pro-odborniky/skoly" class="topic-link topic-link--orange">
        MŠ a&nbsp;ZŠ
      </NuxtLink>
      <NuxtLink
        to="/pro-odborniky/zrizovatele"
        class="topic-link topic-link--blue"
      >
        Zřizovatelé
      </NuxtLink>
      <NuxtLink to="/pro-odborniky/lekari" class="topic-link topic-link--green">
        Lékaři a&nbsp;nutriční terapeuté
      </NuxtLink>
    </nav>

    <h2>Kde jsme se mohli potkat?</h2>
    <ul class="conferences">
      <li>
        <span class="conf-date">4.&ndash;5.&nbsp;12.&nbsp;2025</span>
        <span class="conf-name">Konference Obezitologie a&nbsp;bariatrie</span>
        <span class="conf-talk"
          >Multioborový přístup k&nbsp;terapii dětské obezity v&nbsp;praxi</span
        >
      </li>
      <li>
        <span class="conf-date">30.&ndash;31.&nbsp;5.&nbsp;2025</span>
        <span class="conf-name">Kongres pediatrie pro praxi</span>
        <span class="conf-talk"
          >Co může nabídnout pediatr rodičům dětí s&nbsp;kily navíc ve své
          ordinaci</span
        >
      </li>
      <li>
        <span class="conf-date">29.&nbsp;11.&nbsp;2024</span>
        <span class="conf-name">Konference Dětská výživa a&nbsp;obezita</span>
        <span class="conf-talk"
          >Výživa a&nbsp;výchova v&nbsp;propojení jako prevence dětské nadváhy
          a&nbsp;obezity</span
        >
      </li>
      <li>
        <span class="conf-date">21.&ndash;22.&nbsp;11.&nbsp;2024</span>
        <span class="conf-name">Konference Obezitologie a&nbsp;bariatrie</span>
        <span class="conf-talk"
          >STOB a&nbsp;jeho komplexní přístup v&nbsp;terapii dětské
          obezity</span
        >
      </li>
      <li>
        <span class="conf-date">19.&ndash;20.&nbsp;4.&nbsp;2024</span>
        <span class="conf-name">Konference Dítě: Co vše dítě živí</span>
        <span class="conf-talk">Výživa a&nbsp;výchova v&nbsp;propojení</span>
      </li>
    </ul>

    <ContentImg v-if="image" :image />

    <p>
      Vzdělávání nás baví a&nbsp;je běžnou součástí naší činnosti, ať už na
      straně řečníků nebo posluchačů. Pořádáme přednášky, besedy, webináře,
      kurzy a&nbsp;akce na míru.
    </p>

    <section class="newsletter-section p-not-prose">
      <h2>Odběr novinek pro odborníky</h2>
      <p>
        Chcete, aby vám žádné setkání neuteklo? Přihlašte se k&nbsp;odběru
        novinek pro odborníky.
      </p>
      <NewsletterExpertsForm />
    </section>

    <h2>Chcete s&nbsp;námi spolupracovat?</h2>

    <p>
      Zabýváte se tématem dětské výživy, psychologie či výchovy? Patříte mezi
      odborníky a&nbsp;máte pocit, že by naše spolupráce mohla být prospěšná
      dětem a&nbsp;rodičům nebo vzájemně obohacující? Líbí se vám naše práce
      a&nbsp;chtěli byste nás na vaší akci? Spojte se s&nbsp;námi
      prostřednictvím kontaktního formuláře, ozveme se vám.
    </p>

    <p>
      Jste v&nbsp;oboru začátečník nebo teprve dokončujete studia? Pokud vám jde
      o&nbsp;stejné hodnoty, není to překážka. Pro Jedlíka-nejedlíka je
      podstatné, zda ke své profesi přistupujete zodpovědně a&nbsp;uděláte-li
      chybu, umíte ji přiznat a&nbsp;lidsky či odborně na ni vyrůst. Kvalita
      a&nbsp;odbornost je pro nás zásadní, zároveň si zakládáme na hodnotách
      lidskosti, laskavosti a&nbsp;přijetí, ať už směrem k&nbsp;rodičům nebo
      odborníkům. Nejste si jistí, jestli vaše odbornost stačí?
      <NuxtLink to="#kontaktni-formular">Kontaktujte nás.</NuxtLink>
    </p>

    <h2>S&nbsp;kým nespolupracujeme</h2>

    <p>
      Pokud vás láká s&nbsp;námi spolupracovat, ale výše uvedené na vás nesedí,
      ušetříte mnoho času a&nbsp;energie oběma stranám, když nás nebudete
      ohledně spolupráce kontaktovat. Dále upozorňujeme, že nejsme prodejci
      doplňků stravy a&nbsp;nemáme zájem se jimi stát.
    </p>

    <hr />

    <h2>Odborníci, se kterými dlouhodobě spolupracujeme</h2>

    <p>
      Projekt Jedlík-nejedlík funguje na bázi mezioborové spolupráce.
      V&nbsp;současnosti aktivně spolupracujeme s&nbsp;těmito odborníky:
    </p>

    <div class="experts p-stack">
      <BiographyExpert v-for="bio of biographies" :key="bio.name" :bio />
    </div>

    <hr />

    <p>
      <strong>
        Poskytujete rodičům poradenství v&nbsp;oblasti prevence či intervence
        dětské nadváhy, obezity, ppp či zdravého životního stylu? Dejte
        o&nbsp;sobě vědět.
      </strong>
    </p>

    <p>
      Chceme, aby rodiče řešili obtíže svých dětí s&nbsp;odborníky. Aktuálně
      pracujeme na zveřejnění interaktivní mapy, ve které budou zanesena všechna
      odborná pracoviště, projekty či soukromé poradny odborníků, kteří se
      věnují oblasti dětské výživy či tématům, která s&nbsp;danou problematikou
      souvisí (zejména nutriční terapeut, lékař, dětský psycholog,
      psychoterapeut, klinický logoped, ergoterapeut, fyzioterapeut).
    </p>

    <p>
      Chcete být součástí mapy a&nbsp;být tak blíž rodinám, kteří vaše služby
      hledají? Vyplňte kontaktní formulář a&nbsp;my se vám ozveme. Na kvalitě
      nám záleží. Zanesení do mapy je zpoplatněno manipulačním poplatkem
      a&nbsp;dále doložením vaší odbornosti.
    </p>

    <CooperationForm id="kontaktni-formular" class="coop-form p-not-prose" />
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: image } = await useDirectusImage(
  "212768cd-d1c1-4dc6-a1c8-a121a69efb2c",
)

const { data: biographies } = await useBiographyExpert()
</script>

<style scoped>
.topic-nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-block: var(--space-6);
  max-width: 42rem;
  margin-inline: auto;
}

.topic-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-4);
  text-decoration: none;
  font-weight: var(--font-weight-5);
  font-size: var(--font-size-0);
  text-align: center;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  }
}

.topic-link--orange {
  background: var(--color-star);
  color: var(--color-navy);
}

.topic-link--blue {
  background: var(--color-pale-blue);
  color: var(--color-navy);
}

.topic-link--green {
  background: var(--color-light-lime);
  color: var(--color-forest-green);
}

.newsletter-section {
  margin-block: var(--space-6);
  text-align: center;

  h2 {
    margin-bottom: var(--space-2);
  }

  p {
    margin-bottom: var(--space-5);
  }
}

.conferences {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  li {
    padding: var(--space-4) var(--space-5);
    border-radius: var(--radius-3);
    border-left: 4px solid;
  }

  li:nth-child(5n + 1) {
    background: color-mix(in oklab, var(--color-star), transparent 85%);
    border-left-color: var(--color-star);
  }

  li:nth-child(5n + 2) {
    background: color-mix(in oklab, var(--color-pale-blue), transparent 80%);
    border-left-color: var(--color-pale-blue);
  }

  li:nth-child(5n + 3) {
    background: color-mix(in oklab, var(--color-light-lime), transparent 80%);
    border-left-color: var(--color-light-lime);
  }

  li:nth-child(5n + 4) {
    background: color-mix(in oklab, var(--color-pale-blue), transparent 85%);
    border-left-color: var(--color-pale-blue);
  }

  li:nth-child(5n + 5) {
    background: color-mix(in oklab, var(--color-star), transparent 80%);
    border-left-color: var(--color-star);
  }
}

.conf-date {
  font-size: var(--font-size-00);
  font-style: italic;
  font-variant-numeric: tabular-nums;
  color: var(--text-2);
}

.conf-name {
  display: block;
  font-weight: var(--font-weight-5);
}

.conf-talk {
  display: block;
  font-size: var(--font-size-0);
  margin-top: var(--space-1);

  &::before {
    content: "\201E";
  }

  &::after {
    content: "\201C";
  }
}

.experts {
  --stack-space: var(--space-7);
  margin-block: var(--space-7);
}

.coop-form {
  margin-top: var(--space-6);
  margin-bottom: var(--space-8);
}

@media (--sm-n-below) {
  .topic-nav {
    grid-template-columns: 1fr;
    max-width: 14rem;
  }
}
</style>
