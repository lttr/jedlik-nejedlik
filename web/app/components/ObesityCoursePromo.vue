<template>
  <div class="obesity-course-promo">
    <!-- 1. Hero Section -->
    <section class="hero p-full-bg">
      <div class="hero-content">
        <p class="hero-intro">
          Otevíráme 12týdenní program pro rodiče, kteří hledají
          <strong>dlouhodobé a&nbsp;bezpečné řešení</strong> dětské nadváhy
          a&nbsp;obezity.
        </p>
        <h1>Dětská nadváha pod kontrolou – bez diet a&nbsp;tlaku</h1>
        <p class="hero-subtitle">
          Praktický kurz pro rodiče dětí s&nbsp;nadváhou a&nbsp;obezitou
          3–7&nbsp;let
        </p>
        <p class="start-date">
          <Icon name="uil:calendar-alt" />
          <span>Začínáme <strong>16.&nbsp;března 2026</strong></span>
        </p>
        <div class="hero-cta">
          <a :href="registrationUrl" class="cta-button primary large"
            >Chci se přihlásit</a
          >
        </div>
      </div>
    </section>

    <!-- 1b. Po absolvování kurzu -->
    <section class="after-course-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Po absolvování kurzu</h2>
        <ul class="hero-benefits">
          <li>
            <Icon name="mdi:check-circle" class="benefit-icon" />
            <span>Jste kompetentní a&nbsp;sebejistý průvodce změny</span>
          </li>
          <li>
            <Icon name="mdi:check-circle" class="benefit-icon" />
            <span>Jednáte klidně, bez nátlaku a&nbsp;bez viny</span>
          </li>
          <li>
            <Icon name="mdi:check-circle" class="benefit-icon" />
            <span
              >Dokážete dlouhodobě podporovat změnu v&nbsp;celé rodině a&nbsp;je
              vám v&nbsp;tom dobře</span
            >
          </li>
        </ul>
      </div>
    </section>

    <!-- 2. Výsledky -->
    <section class="results-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Výsledkem je, že:</h2>
        <ul class="results-list">
          <li>
            <Icon name="mdi:check-circle" class="benefit-icon" />
            <span>Nárůst hmotnosti dítěte se zastaví</span>
          </li>
          <li>
            <Icon name="mdi:check-circle" class="benefit-icon" />
            <span
              >Dítě v&nbsp;následujících měsících z&nbsp;nadváhy přirozeně
              vyrůstá</span
            >
          </li>
          <li>
            <Icon name="mdi:check-circle" class="benefit-icon" />
            <span
              ><strong
                >Změna je udržitelná a&nbsp;nepoškozuje ani zdraví dítěte, ani
                váš společný vztah</strong
              ></span
            >
          </li>
        </ul>
      </div>
    </section>

    <!-- 3. Proč je kurz funkční -->
    <section class="why-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Proč je náš kurz funkční a&nbsp;bezpečný?</h2>
        <p class="why-intro">
          Je postavený tak, abyste <strong>nejdřív porozuměli situaci</strong>,
          zvolili si v&nbsp;ní reálné cíle pro vás, získali nástroje, jak
          zvládnout situace, které okolo jídla s&nbsp;dítětem řešíte,
          a&nbsp;<strong>teprve potom se pouštíte do změny</strong>.
        </p>
        <h3 class="subsection-title">V&nbsp;průběhu kurzu:</h3>
        <ul class="course-benefits-list">
          <li>
            Pochopíte, co nadváha a&nbsp;obezita u&nbsp;dětí znamenají
            a&nbsp;jaká nesou rizika – bez strašení a&nbsp;dlouhého vysvětlování
          </li>
          <li>
            Zmapujete, jaké návyky a&nbsp;situace u&nbsp;vás doma změnu
            podporují, nebo brzdí
          </li>
          <li>Naučíte se rozlišovat hlad, sytost, nudu, emoce a&nbsp;návyk</li>
          <li>
            Osvojíte si strategie zvládání emočně náročných situací bez použití
            jídla
          </li>
          <li>Naučíte se hodnotit pokrok podle dlouhodobé udržitelnosti</li>
          <li>Posílíte svou rodičovskou sebedůvěru</li>
        </ul>
        <p class="why-conclusion">
          Z&nbsp;kurzu neodcházíte s&nbsp;návodem na dokonalost a&nbsp;zákazy,
          ale s&nbsp;<strong>realistickým plánem</strong>, který je udržitelný
          a&nbsp;chutná :)
        </p>
      </div>
    </section>

    <!-- 4. Jak kurz probíhá -->
    <section class="format-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Jak kurz probíhá</h2>
        <p class="format-intro">
          Kurz trvá <strong>12&nbsp;týdnů</strong> a&nbsp;kombinuje různé formy
          práce:
        </p>
        <ul class="format-list">
          <li>Předem natočený video obsah</li>
          <li>Pracovní listy navazující na praxi doma</li>
          <li>Průběžný e-mailing</li>
          <li><strong>4 živé skupinové zoomy</strong></li>
          <li>
            <strong>1&nbsp;bonusový podpůrný zoom</strong> měsíc po skončení
            kurzu (v&nbsp;ceně)
          </li>
        </ul>
        <div class="video-types">
          <h3 class="subsection-title">Videa jsou dvojího typu:</h3>
          <div class="video-types-grid">
            <div class="video-type">
              <h4>Informační</h4>
              <p>
                Pomáhají situaci porozumět a&nbsp;ukazují cesty, které vedou ke
                změně.
              </p>
            </div>
            <div class="video-type">
              <h4>Akční</h4>
              <p>
                Vedou ke konkrétním změnám v&nbsp;každodenním fungování rodiny +
                podpora v&nbsp;pracovním listu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Obsah v 5 blocích -->
    <section class="content-blocks-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Obsah kurzu v blocích</h2>
        <p class="content-intro">
          V&nbsp;kurzu vás nezavalíme. Tématy vás provázíme postupně
          v&nbsp;doporučeném harmonogramu. Obsah je rozdělený do pěti logických
          oblastí:
        </p>
        <ol class="content-blocks-list">
          <li>
            <strong>Aktuální situace</strong> – porozumění nadváze, očekáváním
            a&nbsp;prostředí
          </li>
          <li>
            <strong>Rodič jako průvodce změnou</strong> – emoce, hranice,
            komunikace, sebedůvěra
          </li>
          <li>
            <strong>Jídlo bez boje</strong> – hlad × nuda, porce, sladkosti,
            pitný režim
          </li>
          <li>
            <strong>Každodenní návyky</strong> – režim dne, pohyb, spánek,
            stolování
          </li>
          <li>
            <strong>Udržení změny</strong> – jak změnu udržet a&nbsp;žít jí
            s&nbsp;lehkostí, jak poznat, že se nedaří, a&nbsp;kde hledat
            případnou pomoc
          </li>
        </ol>
      </div>
    </section>

    <!-- 6. Co kurz nedělá -->
    <section class="not-doing-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Co kurz záměrně nedělá</h2>
        <ul class="not-doing-list">
          <li>Neřeší váhu dítěte před dítětem</li>
          <li>Nevede dítě k dietnímu myšlení</li>
          <li>Nepoužívá odměny ani tresty</li>
          <li>Nehodnotí vzhled těla</li>
        </ul>
        <p class="not-doing-note">
          Věděli jste, že minimálně do 7&nbsp;let věku je nadváha dítěte
          záležitost především nás dospělých? Dítě není parťák změny, my ano
          a&nbsp;jsme tu pro vás.
        </p>
      </div>
    </section>

    <!-- 7. Cena -->
    <section class="pricing-section p-full-bg">
      <div class="section-content">
        <h2 class="pricing-title">Cena kurzu</h2>
        <div class="price-box">
          <div class="price">
            3&nbsp;800&nbsp;Kč <span class="price-vat">včetně&nbsp;DPH</span>
          </div>
          <p class="price-details">
            Cena zahrnuje 12týdenní vedený program, pracovní listy, živá setkání
            i&nbsp;bonusový podpůrný zoom, který se bude konat měsíc po ukončení
            kurzu, tedy <strong>17.&nbsp;června</strong>.
          </p>
          <p class="price-installments">
            Kurzovné je možné rozdělit do dvou splátek
            (2×&nbsp;2&nbsp;000&nbsp;Kč)
          </p>
          <p class="price-start">Začínáme 16.&nbsp;března 2026</p>
          <a :href="registrationUrl" class="cta-button primary large"
            >Chci se přihlásit</a
          >
        </div>
      </div>
    </section>

    <!-- 8. Je kurz pro vás? -->
    <section class="bmi-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Je kurz pro vás?</h2>
        <p class="bmi-text">
          Nejste si jisti, zda má vaše dítě nadváhu nebo obezitu? Využijte
          kalkulátor dětského BMI, který vám pomůže situaci posoudit.
        </p>
        <a
          href="https://www.childrenbmi.com/"
          class="bmi-link"
          target="_blank"
          rel="noopener"
        >
          <Icon name="mdi:calculator" />
          Spočítat BMI dítěte
          <Icon name="mdi:open-in-new" class="external-icon" />
        </a>
      </div>
    </section>

    <!-- 9. Jedinečnost -->
    <section class="unique-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">V čem je náš kurz jedinečný?</h2>
        <div class="unique-grid">
          <div class="unique-card">
            <h3>Chráníme dítě před tlakem a&nbsp;studem</h3>
            <p>
              Váha ani vzhled se před dítětem neřeší. Odpovědnost zůstává
              u&nbsp;dospělých a&nbsp;prostředí, ve kterém dítě vyrůstá.
            </p>
          </div>
          <div class="unique-card">
            <h3>Změnu chápeme jako proces</h3>
            <p>
              Nečekají vás rychlé výsledky. Učíme vás, jak změnu nastavit tak,
              aby byla dlouhodobě udržitelná a&nbsp;žitelná.
            </p>
          </div>
          <div class="unique-card">
            <h3>Propojujeme výživu, emoce i&nbsp;rodinné fungování</h3>
            <p>
              Kurz neřeší jen jídlo, ale i&nbsp;pohyb, spánek, emoce, vztahy
              a&nbsp;každodenní režim.
            </p>
          </div>
          <div class="unique-card">
            <h3>Respektujeme realitu běžné rodiny</h3>
            <p>
              Cílem není ideál. Pracujeme s&nbsp;tím, co je reálně možné žít
              dlouhodobě bez neustálé kontroly.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 10. Porovnání -->
    <section class="comparison-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">
          Jak se tento kurz liší od běžných programů
        </h2>
        <div class="comparison">
          <div class="comparison-column comparison-column--other">
            <h3>Běžné kurzy</h3>
            <ul>
              <li>Začínají u&nbsp;jídelníčku, porcí a&nbsp;zákazů</li>
              <li>Řeší váhu dítěte přímo s&nbsp;dítětem</li>
              <li>Staví změnu na kontrole a&nbsp;motivaci dítěte</li>
              <li>Slibují rychlé výsledky</li>
              <li>Opomíjejí emoce a&nbsp;rodinné vztahy</li>
            </ul>
          </div>
          <div class="comparison-column comparison-column--ours">
            <h3>Náš kurz</h3>
            <ul>
              <li>Začíná u&nbsp;rodičů a&nbsp;jejich role</li>
              <li>Chrání dítě před tlakem a&nbsp;dietním myšlením</li>
              <li>Pracuje se změnou prostředí, ne s&nbsp;kontrolou dítěte</li>
              <li>Učí vás zvládat frustraci z&nbsp;náročných situací</li>
              <li>Podporuje dlouhodobou změnu bez narušení vztahů</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 11. FAQ -->
    <section class="faq-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Otázky a&nbsp;odpovědi</h2>
        <div class="faq-list">
          <details class="faq-item">
            <summary>Je tento kurz opravdu pro naše dítě?</summary>
            <p>
              Kurz je určen rodičům dětí ve věku
              <strong>3&nbsp;až 7&nbsp;let</strong>, u&nbsp;kterých je přítomná
              nadváha, nebo obezita. Pokud vám pediatr či jiný odborník sdělil,
              že vaše dítě má nadváhu, nebo obezitu, nebo vám vyšel takový
              výsledek na online kalkulačce, a&nbsp;přesto nejste o&nbsp;nadváze
              vašeho dítěte přesvědčeni, kontaktujte Zdeňku Trummovou na
              <a href="mailto:zdenka@jedlik-nejedlik.cz"
                >zdenka@jedlik-nejedlik.cz</a
              >
              a&nbsp;situaci proberte s&nbsp;ní.
            </p>
          </details>

          <details class="faq-item">
            <summary>
              Neublíží kurz dítěti po psychické stránce? Nechceme na dítě
              tlačit.
            </summary>
            <p>
              Ne. Ochrana dítěte je jedním ze základních principů kurzu. Je to
              jedna z&nbsp;těch věcí, která dělá náš kurz jedinečný.
            </p>
          </details>

          <details class="faq-item">
            <summary>
              Nebudeme v&nbsp;kurzu řešit diety nebo počítání kalorií?
            </summary>
            <p>
              Ne. Kurz není dietní a&nbsp;není postaven na počítání kalorií.
              Učíme vás měnit prostředí a&nbsp;návyky tak, aby zdravější chování
              vznikalo přirozeně.
            </p>
          </details>

          <details class="faq-item">
            <summary>
              Co když už jsme zkoušeli změnu a&nbsp;nefungovalo to?
            </summary>
            <p>
              To je velmi častá zkušenost. Kurz pracuje i&nbsp;s&nbsp;tím,
              <strong>proč předchozí pokusy selhaly</strong>. Často ne kvůli
              nedostatku snahy, ale kvůli nerealistickým očekáváním, tlaku na
              dítě, přetížení rodičů, nízké kvalitě odborného vedení, nebo
              příliš rychlému tempu.
            </p>
          </details>

          <details class="faq-item">
            <summary>Co když změnu nechce druhý rodič nebo rodina?</summary>
            <p>
              Téma nesouladu mezi dospělými je možné otevřít na jednom
              z&nbsp;podpůrných zoomů. V&nbsp;praxi vidíme, že i&nbsp;přesto, že
              jeden rodič změnu nepodporuje, pro dítě je prospěšné, když se
              alespoň jeden rodič snaží, protože nárůst hmotnosti dítěte není
              tak rychlý.
            </p>
          </details>

          <details class="faq-item">
            <summary>Musíme změnit celý život rodiny?</summary>
            <p>
              Ne. Kurz není o&nbsp;„převrácení života naruby“. Učíme vás hledat
              <strong>malé, ale funkční změny</strong>, které lze dlouhodobě
              udržet v&nbsp;běžném rodinném provozu.
            </p>
          </details>

          <details class="faq-item">
            <summary>Jak rychle uvidíme výsledky?</summary>
            <p>
              U&nbsp;každé rodiny je to jiné, každé dítě má jinou závažnost
              nadváhy či obezity, jiné startovací podmínky. Kurz neslibuje
              rychlé výsledky. Cílem je zastavení dalšího nárůstu hmotnosti
              a&nbsp;vytvoření podmínek, ve kterých dítě může z&nbsp;nadváhy
              <strong>postupně vyrůst</strong>, což je v&nbsp;praxi jeden
              z&nbsp;nejbezpečnějších způsobů práce s&nbsp;dětmi v&nbsp;tomto
              věku. Tempo změny je tedy individuální.
            </p>
          </details>

          <details class="faq-item">
            <summary>Co když kurz časově nezvládneme?</summary>
            <p>
              Kurz je kombinací předtočeného obsahu a&nbsp;živých setkání.
              Materiály vám posíláme postupně. Pokud doporučené tempo nestíháte,
              nic se neděje, videa si pustíte vlastním tempem. Živé zoomy slouží
              k&nbsp;ukotvení a&nbsp;podpoře, ne ke kontrole. Po ukončení kurzu
              bude následovat za měsíc podpůrný zoom, kde si můžete ujasnit
              dohnaná témata. Pokud budete potřebovat i&nbsp;tak víc podpory, je
              možné se domluvit na další formě spolupráce za zvýhodněnou cenu.
            </p>
          </details>

          <details class="faq-item">
            <summary>
              Budeme v&nbsp;kurzu „hodnoceni“, jestli to děláme správně?
            </summary>
            <p>
              Ne. Kurz není o&nbsp;kontrole ani o&nbsp;výkonu. Během skupinových
              zoomů vám rádi poskytneme zpětnou vazbu ke krokům, které
              podnikáte, ale pouze pokud o&nbsp;to budete mít zájem. Neexistuje
              „správné tempo“. Pracujete s&nbsp;tím, kde jste teď,
              a&nbsp;hledáte udržitelnou cestu dál.
            </p>
          </details>
        </div>
      </div>
    </section>

    <PaymentLogos class="payment-logos-spacing" />
  </div>
</template>

<script setup lang="ts">
const registrationUrl = "https://form.simpleshop.cz/yXRL9/buy/"
</script>

<style scoped>
.obesity-course-promo {
  --section-padding: var(--space-8);
}

/* Hero Section */
.hero {
  background-color: white;
  padding-block: var(--space-8);
  margin-top: calc(-1 * var(--space-6));
}

.hero-content {
  max-width: var(--size-content-3);
  margin-inline: auto;
  text-align: center;
}

.hero-intro {
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-6);
  text-wrap: pretty;
}

.hero h1 {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);
  line-height: var(--font-lineheight-1);
  margin-bottom: var(--space-4);
  color: var(--brand-color);
}

.hero-subtitle {
  font-size: var(--font-size-2);
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-2);
  text-wrap: pretty;
}

.start-date {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-peach);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-round);
  margin-top: var(--space-5);
  margin-bottom: var(--space-6);
  font-size: var(--font-size-1);
}

.hero-benefits {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-6);
  text-align: left;
}

.hero-benefits li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-1);
}

.benefit-icon {
  color: var(--color-forest-green);
  font-size: var(--font-size-3);
  flex-shrink: 0;
}

.hero-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* CTA Buttons */
.cta-button {
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-round);
  font-weight: var(--font-weight-6);
  text-decoration: none;
  text-align: center;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.cta-button.primary {
  background-color: var(--color-light-lime);
  color: var(--color-forest-green);
}

.cta-button.primary:hover {
  background-color: color-mix(in srgb, var(--color-light-lime) 80%, white);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.cta-button.large {
  padding: var(--space-4) var(--space-7);
  font-size: var(--font-size-1);
}

/* Section Common Styles */
.section-content {
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.section-title {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);
  text-align: center;
  margin-bottom: var(--space-6);
}

.subsection-title {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-4);
}

/* After Course Section */
.after-course-section {
  background-color: white;
  padding-block: var(--space-5);
}

.after-course-section .section-title {
  margin-bottom: var(--space-4);
}

/* Results Section */
.results-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.results-list {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
  text-align: left;
}

.results-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-size: var(--font-size-1);
  margin-bottom: var(--space-3);
}

/* Why Section */
.why-section {
  background-color: white;
  padding-block: var(--section-padding);
}

.why-intro {
  font-size: var(--font-size-1);
  text-align: center;
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-6);
}

.course-benefits-list {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-6);
}

.course-benefits-list li {
  position: relative;
  padding-left: var(--space-5);
  margin-bottom: var(--space-3);
}

.course-benefits-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--color-forest-green);
  font-weight: bold;
}

.why-conclusion {
  font-size: var(--font-size-1);
  text-align: center;
  padding: var(--space-5);
  background-color: var(--color-peach);
  border-radius: var(--radius-3);
  max-width: var(--size-content-2);
  margin-inline: auto;
}

/* Format Section */
.format-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.format-intro {
  font-size: var(--font-size-1);
  text-align: center;
  margin-bottom: var(--space-5);
}

.format-list {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-6);
}

.format-list li {
  position: relative;
  padding-left: var(--space-5);
  margin-bottom: var(--space-3);
}

.format-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-burgundy-red);
  font-weight: bold;
}

.video-types {
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.video-types-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.video-type {
  background-color: white;
  padding: var(--space-5);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-2);
}

.video-type h4 {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  color: var(--color-burgundy-red);
  margin-bottom: var(--space-2);
}

.video-type p {
  font-size: var(--font-size-0);
  margin: 0;
}

/* Content Blocks Section */
.content-blocks-section {
  background-color: white;
  padding-block: var(--section-padding);
}

.content-intro {
  font-size: var(--font-size-1);
  text-align: center;
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-6);
}

.content-blocks-list {
  max-width: var(--size-content-2);
  margin-inline: auto;
  padding-left: var(--space-5);
}

.content-blocks-list li {
  font-size: var(--font-size-1);
  margin-bottom: var(--space-4);
  padding-left: var(--space-2);
}

.content-blocks-list li::marker {
  color: var(--color-burgundy-red);
  font-weight: var(--font-weight-7);
}

/* Not Doing Section */
.not-doing-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.not-doing-list {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-5);
}

.not-doing-list li {
  position: relative;
  padding-left: var(--space-5);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-1);
}

.not-doing-list li::before {
  content: "✗";
  position: absolute;
  left: 0;
  color: var(--color-burgundy-red);
  font-weight: bold;
}

.not-doing-note {
  font-size: var(--font-size-0);
  text-align: center;
  font-style: italic;
  color: var(--text-2);
  max-width: var(--size-content-2);
  margin-inline: auto;
}

/* Pricing Section */
.pricing-section {
  background-color: var(--color-burgundy-red);
  color: white;
  padding-block: var(--section-padding);
  text-align: center;
}

.pricing-title {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-6);
}

.price-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.price {
  font-size: var(--font-size-2);
  font-weight: 700;
}

.price-vat {
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-4);
  opacity: 0.8;
}

.price-details {
  font-size: var(--font-size-1);
  max-width: var(--size-content-2);
}

.price-installments {
  font-size: var(--font-size-0);
  color: rgb(255 255 255 / 90%);
  margin-bottom: var(--space-2);
}

.price-start {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-4);
}

.payment-logos-spacing {
  margin-top: var(--space-9);
  margin-bottom: var(--space-4);
}

/* BMI Section */
.bmi-section {
  background-color: white;
  padding-block: var(--section-padding);
  text-align: center;
}

.bmi-text {
  font-size: var(--font-size-1);
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-5);
}

.bmi-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  color: var(--color-burgundy-red);
  text-decoration: none;
  padding: var(--space-3) var(--space-5);
  border: 2px solid var(--color-burgundy-red);
  border-radius: var(--radius-round);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.bmi-link:hover {
  background-color: var(--color-burgundy-red);
  color: white;
}

.external-icon {
  font-size: var(--font-size-0);
  opacity: 0.7;
}

/* Unique Section */
.unique-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.unique-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.unique-card {
  background-color: white;
  padding: var(--space-5);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-2);
}

.unique-card h3 {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-3);
  color: var(--color-burgundy-red);
}

.unique-card p {
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin: 0;
}

/* Comparison Section */
.comparison-section {
  background-color: white;
  padding-block: var(--section-padding);
}

.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.comparison-column {
  padding: var(--space-5);
  border-radius: var(--radius-3);
}

.comparison-column h3 {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-4);
  text-align: center;
}

.comparison-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comparison-column li {
  position: relative;
  padding-left: var(--space-5);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-0);
}

.comparison-column--other {
  background-color: var(--surface-1);
}

.comparison-column--other h3 {
  color: var(--text-2);
}

.comparison-column--other li::before {
  content: "✗";
  position: absolute;
  left: 0;
  color: var(--text-2);
  font-weight: bold;
}

.comparison-column--ours {
  background-color: var(--color-light-lime);
}

.comparison-column--ours h3 {
  color: var(--color-forest-green);
}

.comparison-column--ours li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--color-forest-green);
  font-weight: bold;
}

/* FAQ Section */
.faq-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.faq-list {
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.faq-item {
  margin-bottom: var(--space-3);
  background-color: white;
  border-radius: var(--radius-3);
  overflow: hidden;
}

.faq-item summary {
  padding: var(--space-4) var(--space-5);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.faq-item summary::after {
  content: "+";
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-4);
  color: var(--color-burgundy-red);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.faq-item[open] summary::after {
  content: "−";
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item p {
  padding: 0 var(--space-5) var(--space-5);
  margin: 0;
  font-size: var(--font-size-0);
  color: var(--text-2);
  line-height: var(--font-lineheight-3);
}

.faq-item a {
  color: var(--color-burgundy-red);
}

/* Responsive */
@media (--lg-n-below) {
  .hero h1 {
    font-size: var(--font-size-5);
  }

  .unique-grid {
    grid-template-columns: 1fr;
  }
}

@media (--md-n-below) {
  .video-types-grid {
    grid-template-columns: 1fr;
  }

  .comparison {
    grid-template-columns: 1fr;
  }
}

@media (--sm-n-below) {
  .obesity-course-promo {
    --section-padding: var(--space-6);
  }

  .hero {
    padding-block: var(--space-6);
  }

  .hero h1 {
    font-size: var(--font-size-4);
  }

  .section-title {
    font-size: var(--font-size-3);
  }

  .start-date {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
