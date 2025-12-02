<template>
  <PageWrapper root-element="article" class="p-prose">
    <h1>Výživa a výchova v propojení</h1>

    <p class="p-base-text-bold">
      Milí odborníci, vítejte na stránkách projektu Jedlík-nejedlík.
    </p>

    <p>
      Věříme, že prevence je základním krokem pro eliminaci nárůstu dětské
      nadváhy a obezity na jedné straně a poruch příjmu potravy na straně druhé.
    </p>

    <p>
      Proto přicházíme s konceptem výživy a výchovy v propojení jako nástrojem
      prevence, který si klade za cíl připravit rodiče na výchovné situace okolo
      jídla tak, aby je zvládnul. Rodič, který ustojí dětská
      <i>&bdquo;blééé, fuj, nechci apod.&ldquo;</i>, nerezignuje při prvním
      nezdaru na výživová doporučení a bude schopen podporovat zdravý životní
      styl u svých dětí dlouhodobě.
    </p>

    <div class="p-flow">
      <h2 class="p-base-text-bold">Naše cíle jsou:</h2>
      <ul>
        <li>
          poskytovat rodičům odborné a profesně provázané poradenství k tématům
          nejedlictví, nadváhy, obezity a zdravého životního stylu u dětí i
          rodiny jako celku.
        </li>
        <li>
          vytvářet prostor pro prezentaci odborníků a odborných pracovišť, které
          poskytují poradenství ve výše uvedených oblastech
        </li>
        <li>
          otevírat prostor pro spolupráci odborníků, kteří chtějí táhnout v
          uvedených oblastech za jeden provaz
        </li>
        <li>
          poskytovat odborníkům možnost dalšího vzdělávání v
          pedagogicko-psychologických tématech v kontextu výživy
        </li>
        <li>umožňovat pravidelná intervizní setkání</li>
      </ul>
    </div>

    <h2>Chcete s námi spolupracovat?</h2>

    <p>
      Zabýváte se tématem dětské výživy, psychologie či výchovy? Patříte mezi
      odborníky a máte pocit, že by naše spolupráce mohla být prospěšná dětem a
      rodičům nebo vzájemně obohacující? Líbí se vám naše práce a chtěli byste
      nás na vaší akci? Spojte se s námi prostřednictvím kontaktního formuláře,
      ozveme se vám.
    </p>

    <p>
      <ContentImg v-if="image" :image />
    </p>

    <p>
      Jste v oboru začátečník nebo teprve dokončujete studia? Pokud vám jde o
      stejné hodnoty, není to překážka. Pro Jedlíka-nejedlíka je podstatné, zda
      ke své profesi přistupujete zodpovědně a uděláte-li chybu, umíte ji
      přiznat a lidsky či odborně na ni vyrůst. Kvalita a odbornost je pro nás
      zásadní, zároveň si zakládáme na hodnotách lidskosti, laskavosti a
      přijetí, ať už směrem k rodičům nebo odborníkům. Nejste si jistí, jestli
      vaše odbornost stačí?
      <NuxtLink to="#kontaktni-formular">Kontaktujte nás.</NuxtLink>
    </p>

    <h2>S kým nespolupracujeme</h2>

    <p>
      Pokud vás láká s námi spolupracovat, ale výše uvedené na vás nesedí,
      ušetříte mnoho času a energie oběma stranám, když nás nebudete ohledně
      spolupráce kontaktovat. Dále upozorňujeme, že nejsme prodejci doplňků
      stravy a nemáme zájem se jimi stát.
    </p>

    <hr />

    <h2>Odborníci, se kterými dlouhodobě spolupracujeme</h2>

    <p>
      Projekt Jedlík-nejedlík funguje na bázi mezioborové spolupráce. V
      současnosti aktivně spolupracujeme s těmito odborníky:
    </p>

    <div class="experts p-stack">
      <BiographyExpert v-for="bio of biographies" :key="bio.name" :bio />
    </div>

    <hr />

    <p>
      <strong>
        Poskytujete rodičům poradenství v oblasti prevence či intervence dětské
        nadváhy, obezity, ppp či zdravého životního stylu? Dejte o sobě vědět.
      </strong>
    </p>

    <p>
      Chceme, aby rodiče řešili obtíže svých dětí s odborníky. Aktuálně
      pracujeme na zveřejnění interaktivní mapy, ve které budou zanesena všechna
      odborná pracoviště, projekty či soukromé poradny odborníků, kteří se
      věnují oblasti dětské výživy či tématům, která s danou problematikou
      souvisí (zejména nutriční terapeut, lékař, dětský psycholog,
      psychoterapeut, klinický logoped, ergoterapeut, fyzioterapeut).
    </p>

    <p>
      Chcete být součástí mapy a být tak blíž rodinám, kteří vaše služby
      hledají? Vyplňte kontaktní formulář a my se vám ozveme. Na kvalitě nám
      záleží. Zanesení do mapy je zpoplatněno manipulačním poplatkem a dále
      doložením vaší odbornosti.
    </p>

    <CooperationForm id="kontaktni-formular" class="coop-form p-not-prose" />

    <h2>Vzdělávání pro odbornou veřejnost</h2>
    <p>
      Organizace Jedlík-nejedlík nabízí možnost dalšího vzdělávání, které je
      určeno pro odbornou veřejnost zaměřující se na oblast dětské výživy a
      práci s rodiči. Více informací
      <NuxtLink to="/vzdelavani-pro-odborniky">ZDE</NuxtLink>.
    </p>

    <p>
      Chcete se nás na něco zeptat?
      <NuxtLink to="/kontakt">Využijte kontaktní formulář.</NuxtLink>
    </p>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: image } = await useDirectusImage(
  "212768cd-d1c1-4dc6-a1c8-a121a69efb2c",
)

const { data: biographies } = await useBiographyExpert()
</script>

<style scoped>
.experts {
  --stack-space: var(--space-7);
  margin-block: var(--space-7);
}

.coop-form {
  margin-top: var(--space-6);
  margin-bottom: var(--space-8);
}
</style>
