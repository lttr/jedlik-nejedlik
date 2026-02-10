<template>
  <PageWrapper root-element="article">
    <div class="p-prose">
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
            k&nbsp;tématům nejedlictví, nadváhy, obezity a&nbsp;zdravého
            životního stylu u&nbsp;dětí i&nbsp;rodiny jako celku
          </li>
          <li>
            vytvářet prostor pro prezentaci odborníků a&nbsp;odborných
            pracovišť, které poskytují poradenství ve výše uvedených oblastech
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
    </div>

    <nav class="target-cards">
      <NuxtLink to="/pro-odborniky/skoly" class="target-card card--schools">
        <span class="card-icon">🏫</span>
        <span class="card-label">MŠ a&nbsp;ZŠ</span>
      </NuxtLink>
      <NuxtLink
        to="/pro-odborniky/zrizovatele"
        class="target-card card--municipalities"
      >
        <span class="card-icon">🏛️</span>
        <span class="card-label">Zřizovatelé</span>
      </NuxtLink>
      <NuxtLink to="/pro-odborniky/lekari" class="target-card card--doctors">
        <span class="card-icon">⚕️</span>
        <span class="card-label">Lékaři a&nbsp;nutriční terapeuté</span>
      </NuxtLink>
    </nav>

    <div class="p-prose">
      <p>
        Vzdělávání nás baví a&nbsp;je běžnou součástí naší činnosti, ať už na
        straně řečníků nebo posluchačů. Pořádáme přednášky, besedy, webináře,
        kurzy a&nbsp;akce na míru.
      </p>

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
          Konference Obezitologie a&nbsp;bariatrie &ndash; 21.&ndash;22.
          listopadu 2024 &ndash; příspěvek: &bdquo;STOB a&nbsp;jeho komplexní
          přístup v&nbsp;terapii dětské obezity&ldquo;
        </li>
        <li>
          Konference Dětská výživa a&nbsp;obezita 29. 11. 2024 &ndash;
          příspěvek: &bdquo;Výživa a&nbsp;výchova v&nbsp;propojení&ldquo;
        </li>
        <li>
          Konference Dítě: Co vše dítě živí &ndash; 19.&ndash;20. dubna 2024
          &ndash; příspěvek: &bdquo;Výživa a&nbsp;výchova
          v&nbsp;propojení&ldquo;
        </li>
      </ul>

      <ContentImg v-if="image" :image />
    </div>

    <section class="newsletter-section">
      <h2>Odběr novinek pro odborníky</h2>
      <p>
        Chcete, aby vám žádné setkání neuteklo? Přihlašte se k&nbsp;odběru
        novinek pro odborníky.
      </p>
      <NewsletterExpertsForm />
    </section>

    <div class="p-prose">
      <h2>Chcete s námi spolupracovat?</h2>

      <p>
        Zabýváte se tématem dětské výživy, psychologie či výchovy? Patříte mezi
        odborníky a máte pocit, že by naše spolupráce mohla být prospěšná dětem
        a rodičům nebo vzájemně obohacující? Líbí se vám naše práce a chtěli
        byste nás na vaší akci? Spojte se s námi prostřednictvím kontaktního
        formuláře, ozveme se vám.
      </p>

      <ContentImg v-if="image" :image />

      <p>
        Jste v oboru začátečník nebo teprve dokončujete studia? Pokud vám jde o
        stejné hodnoty, není to překážka. Pro Jedlíka-nejedlíka je podstatné,
        zda ke své profesi přistupujete zodpovědně a uděláte-li chybu, umíte ji
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

      <CooperationForm id="kontaktni-formular" class="coop-form p-not-prose" />

      <p>
        Chcete se nás na něco zeptat?
        <NuxtLink to="/kontakt">Využijte kontaktní formulář.</NuxtLink>
      </p>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: image } = await useDirectusImage(
  "212768cd-d1c1-4dc6-a1c8-a121a69efb2c",
)

const { data: biographies } = await useBiographyExpert()
</script>

<style scoped>
.target-cards {
  display: flex;
  gap: var(--space-4);
  margin-block: var(--space-6);
}

.target-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-3);
  text-align: center;
  background: var(--surface-1);
  border-radius: var(--radius-3);
  border-top: 3px solid var(--card-color);
  text-decoration: none;
  color: var(--text-color-1);
  transition: transform 0.15s ease;
}

.target-card:hover {
  transform: translateY(-2px);
}

.card--schools {
  --card-color: var(--color-orange-soda);
}

.card--municipalities {
  --card-color: var(--color-pale-blue);
}

.card--doctors {
  --card-color: var(--color-forest-green);
}

.card-icon {
  font-size: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--card-color) 12%, white);
}

.card-label {
  font-weight: 700;
  font-size: var(--font-size-0);
  line-height: 1.3;
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
  .target-cards {
    flex-direction: column;
  }
}
</style>
