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
        Konference Obezitologie a&nbsp;bariatrie &ndash; 4.&ndash;5. 12. 2025
        &ndash; příspěvek: &bdquo;Multioborový přístup k&nbsp;terapii dětské
        obezity v&nbsp;praxi&ldquo;
      </li>
      <li>
        Kongres pediatrie pro praxi &ndash; 30.&ndash;31. 5. 2025 &ndash;
        příspěvek: &bdquo;Co může nabídnout pediatr rodičům dětí s&nbsp;kily
        navíc ve své ordinaci&ldquo;
      </li>
      <li>
        Konference Dětská výživa a&nbsp;obezita &ndash; 29. 11. 2024 &ndash;
        příspěvek: &bdquo;Výživa a&nbsp;výchova v&nbsp;propojení jako prevence
        dětské nadváhy a&nbsp;obezity&ldquo;
      </li>
      <li>
        Konference Obezitologie a&nbsp;bariatrie &ndash; 21.&ndash;22. listopadu
        2024 &ndash; příspěvek: &bdquo;STOB a&nbsp;jeho komplexní přístup
        v&nbsp;terapii dětské obezity&ldquo;
      </li>
      <li>
        Konference Dítě: Co vše dítě živí &ndash; 19.&ndash;20. dubna 2024
        &ndash; příspěvek: &bdquo;Výživa a&nbsp;výchova v&nbsp;propojení&ldquo;
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

  li {
    padding-block: var(--space-3);
    border-bottom: 1px solid var(--surface-3);
  }

  li:last-child {
    border-bottom: none;
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
