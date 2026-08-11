<template>
  <div class="live-course-promo">
    <!-- 1. Hero -->
    <section class="hero p-full-bg">
      <div class="hero-content">
        <p class="hero-eyebrow">Kurz zdravého (ne)hubnutí naživo</p>
        <h1>Kurz zdravého (ne)hubnutí pro děti {{ gradeRange }} v&nbsp;Hradci Králové</h1>
        <p class="hero-subtitle">
          Svěřte své děti do rukou skutečných odborníků a&nbsp;naučte se společně žít zdravěji.
        </p>

        <dl class="key-facts">
          <div class="key-fact">
            <dt><Icon name="uil:calendar-alt" /> Termín</dt>
            <dd>{{ term }}</dd>
          </div>
          <div class="key-fact">
            <dt><Icon name="uil:clock" /> Den a&nbsp;čas</dt>
            <dd>{{ dayAndTime }}</dd>
          </div>
          <div class="key-fact">
            <dt><Icon name="uil:map-marker" /> Místo konání</dt>
            <dd>Školka Chytrulky<br />Bratří Štefanů 126/17<br />Hradec Králové 500&nbsp;03</dd>
          </div>
        </dl>

        <div class="hero-cta">
          <a :href="orderUrl" class="cta-button primary large" target="_blank" rel="noopener">
            Objednat kurz
          </a>
          <p class="cta-note">Objednávka probíhá v&nbsp;rezervačním systému STOB.</p>
        </div>
      </div>
    </section>

    <!-- 2. Pro koho je kurz -->
    <section class="questions-section p-full-bg">
      <div class="section-content">
        <ul class="questions-list">
          <li>Máte doma dítě s&nbsp;kilogramy navíc, se kterými si nevíte rady?</li>
          <li>
            Věděli jste, že dítě by do určitého věku nemělo držet diety, ale měnit svoji hmotnost
            rozumnou změnou stravovacích návyků?
          </li>
          <li>
            Chcete vaše dítě podpořit v&nbsp;dlouhodobě udržitelném přístupu a&nbsp;zdravém vztahu
            k&nbsp;jídlu?
          </li>
        </ul>
        <p class="questions-conclusion">
          Kurz je určen pro děti od {{ gradeFrom }} do {{ gradeTo }} třídy a&nbsp;zábavnou formou je
          vede k&nbsp;postupné změně životního stylu, který jako jediný vede dlouhodobě
          k&nbsp;adekvátní hmotnosti dítěte a&nbsp;podpoře jeho zdraví.
        </p>
      </div>
    </section>

    <!-- 3. Co se děti naučí -->
    <section class="children-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Děti se v&nbsp;kurzu naučí</h2>
        <ul class="check-list">
          <li>
            Jak si vytvořit prospěšný a&nbsp;vyvážený jídelníček bez počítání a&nbsp;zakázaných
            potravin
          </li>
          <li>Jak si budovat zdravý vztah k&nbsp;jídlu i&nbsp;k&nbsp;sobě</li>
          <li>Jak získat motivaci k&nbsp;pohybu a&nbsp;mít z&nbsp;něj radost</li>
          <li>Rozlišovat hlad, chuť a&nbsp;nudu a&nbsp;adekvátně na ně reagovat</li>
          <li>
            Jak si poradit v&nbsp;situacích, které nás lákají k&nbsp;jídlu navíc – a&nbsp;především
            s&nbsp;podporou odbornice a&nbsp;skupiny převést tyto znalosti do praktického života
            a&nbsp;mnoho dalšího
          </li>
        </ul>
      </div>
    </section>

    <!-- 4. Co získá rodič -->
    <section class="parents-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Rodič v&nbsp;kurzu získá</h2>
        <ul class="check-list">
          <li>Kvalitní informace o&nbsp;výživě dítěte</li>
          <li>Podporu, jak dítě provést změnou a&nbsp;nepokazit si při tom s&nbsp;dítětem vztah</li>
          <li>Pochopení a&nbsp;pomocnou ruku při náročných výchovných situacích okolo jídla</li>
          <li>Posílení rodičovské sebedůvěry</li>
          <li>
            Recepty a&nbsp;praktické tipy do kuchyně, aniž byste museli kupovat speciální
            a&nbsp;drahé potraviny&nbsp;;)
          </li>
        </ul>
      </div>
    </section>

    <!-- 5. Jak kurz probíhá -->
    <section class="format-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Jak kurz probíhá</h2>
        <ul class="format-list">
          <li>10 skupinových lekcí pro děti (70&nbsp;min)</li>
          <li>
            10 skupinových setkání rodičů na konci každé lekce (10&nbsp;minut), kde lektorka provede
            shrnutí lekce. Rodič se dozví, jak se dětem daří a&nbsp;na čem by bylo dobré do
            následujícího setkání pracovat. Pokud se rodič mimořádně nemůže zúčastnit, bude mu
            shrnutí zasláno mailem.
          </li>
          <li>
            1.&nbsp;a&nbsp;10.&nbsp;lekce probíhá celá za přítomnosti rodiče, 5.&nbsp;a&nbsp;6.
            lekce s&nbsp;částečnou účastí rodiče.
          </li>
        </ul>

        <h3 class="subsection-title">Kurz se skládá ze tří částí</h3>
        <ol class="parts-list">
          <li>
            <strong>1.&nbsp;–&nbsp;5.&nbsp;lekce</strong> ({{ lessonsPart1 }} vždy od
            {{ timeRange }})
          </li>
          <li>
            <strong>Udržovací pauza 8&nbsp;týdnů</strong>, ve které rodina prakticky zkouší poznatky
            získané v&nbsp;první části kurzu
          </li>
          <li><strong>6.&nbsp;–&nbsp;10.&nbsp;lekce</strong> ({{ lessonsPart2 }})</li>
        </ol>

        <h3 class="subsection-title">Součástí kurzu dále budou</h3>
        <ul class="format-list">
          <li>Skupinové setkání rodičů na platformě ZOOM před 1.&nbsp;lekcí</li>
          <li>Skupinové podpůrné setkání rodičů v&nbsp;průběhu udržovací pauzy</li>
          <li>
            Individuální konzultace s&nbsp;rodičem po skončení kurzu (20&nbsp;minut), kdy lektorka
            zhodnotí postup dítěte a&nbsp;doporučí případné další kroky na cestě k&nbsp;cíli
          </li>
          <li>Praktické atraktivní materiály a&nbsp;pracovní listy</li>
          <li>Podpora rodičů prostřednictvím WhatsApp skupiny – v&nbsp;případě zájmu</li>
        </ul>

        <p class="format-note">
          Program využívá skupinové dynamiky, kdy děti mohou využít podporu ostatních, se kterými
          sdílejí podobné problémy, a&nbsp;společně hledat fungující řešení. Často se skamarádí
          a&nbsp;domlouvají se i&nbsp;na dalších společných aktivitách po skončení kurzu.
        </p>
      </div>
    </section>

    <!-- 6. Lektorka -->
    <section class="lecturer-section p-full-bg">
      <div class="section-content">
        <h2 class="section-title">Kdo vás bude celým kurzem provázet?</h2>
        <p class="lecturer-intro">
          Lektorkou kurzu je nutriční poradkyně, life style kouč, pedagog a&nbsp;zakladatelka
          projektu Jedlík-nejedlík <strong>Zdeňka Trummová</strong>.
        </p>
        <p>
          Zdeňka se věnuje nejen přímé práci s&nbsp;dětskými klienty a&nbsp;jejich rodiči, ale
          spolupracuje také s&nbsp;dětskými lékaři, přednáší na odborných konferencích a&nbsp;tvoří
          metodické materiály týkající se dětské nadváhy a&nbsp;obezity.
        </p>
        <blockquote class="lecturer-quote">
          <p>
            Obezitu jsem zažívala v&nbsp;dětství na vlastní kůži, díky čemuž dokáži vnímat mnohé
            překážky svých klientů při procesu hubnutí i&nbsp;při udržení váhy. Téma dětské nadváhy
            je moje srdcová záležitost. Následky dětské obezity si vláčím doživotně s&nbsp;sebou jak
            na těle, tak na duši. Pomáhám rodičům na cestě za zdravím jejich dětí, protože žádné
            dítě si nemusí nést následky obezity do dospělosti.
          </p>
        </blockquote>
        <p>
          <NuxtLink to="/o-nas">Více o&nbsp;Zdeňce a&nbsp;o&nbsp;našem týmu</NuxtLink>
        </p>
      </div>
    </section>

    <!-- 7. Cena -->
    <section class="pricing-section p-full-bg">
      <div class="section-content">
        <h2 class="pricing-title">Cena kurzu</h2>
        <div class="price-box">
          <p class="price">
            3&nbsp;900&nbsp;Kč
            <span class="price-original">původní cena 7&nbsp;000&nbsp;Kč</span>
          </p>
          <p class="price-details">
            Díky mimořádné podpoře je původní cena 7&nbsp;000&nbsp;Kč snížena na
            3&nbsp;900&nbsp;Kč&nbsp;za celý kurz. Projekt finančně podporuje společnost Boehringer
            Ingelheim, která se dlouhodobě věnuje péči o&nbsp;zdraví jak současných, tak budoucích
            generací.
          </p>
          <a :href="orderUrl" class="cta-button primary large" target="_blank" rel="noopener">
            Objednat kurz
          </a>
          <p class="cta-note">Objednávka probíhá v&nbsp;rezervačním systému STOB.</p>
        </div>
      </div>
    </section>

    <!-- 8. Kapacita a kontakt -->
    <section class="capacity-section p-full-bg">
      <div class="section-content">
        <p class="capacity-text">
          Kurz má omezenou kapacitu, pracujeme v&nbsp;malé skupince
          <strong>max.&nbsp;{{ capacity }}&nbsp;dětí</strong>. Pokud máte zájem, přihlaste se co
          nejdříve. Po přihlášení vás budeme kontaktovat s&nbsp;dalšími informacemi. Do přihlášky
          prosím uvádějte datum narození vašeho dítěte.
        </p>
        <p class="capacity-contact">
          Máte otázky? Napište na
          <a href="mailto:info@jedlik-nejedlik.cz">info@jedlik-nejedlik.cz</a> nebo zavolejte na
          <a href="tel:+420732651959">732&nbsp;651&nbsp;959</a>.
        </p>
        <p class="capacity-outro">Těšíme se na viděnou v&nbsp;kurzu!</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const {
  gradeRange,
  gradeFrom,
  gradeTo,
  term,
  dayAndTime,
  timeRange,
  lessonsPart1,
  lessonsPart2,
  capacity,
  orderUrl,
} = defineProps<{
  /** e.g. "6.–9. třída" */
  gradeRange: string
  /** e.g. "6." — used in the "od X do Y třídy" sentence */
  gradeFrom: string
  /** e.g. "9." — used in the "od X do Y třídy" sentence */
  gradeTo: string
  /** e.g. "22. 9. 2026 – 23. 2. 2027" */
  term: string
  /** e.g. "Úterý 17:05–18:20" */
  dayAndTime: string
  /** e.g. "17:05 do 18:20" */
  timeRange: string
  /** Dates of lessons 1–5 */
  lessonsPart1: string
  /** Dates of lessons 6–10 */
  lessonsPart2: string
  /** Maximum number of children in the group */
  capacity: number
  /** STOB order process URL */
  orderUrl: string
}>()
</script>

<style scoped>
.live-course-promo {
  --section-padding: var(--space-8);
}

/* Hero */
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

.hero-eyebrow {
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-burgundy-red);
  margin-bottom: var(--space-3);
}

.hero h1 {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);
  line-height: var(--font-lineheight-1);
  margin-bottom: var(--space-4);
  color: var(--brand-color);
  text-wrap: balance;
}

.hero-subtitle {
  font-size: var(--font-size-2);
  max-width: var(--size-content-2);
  margin-inline: auto;
  text-wrap: pretty;
}

/* Key facts */
.key-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-block: var(--space-6);
  text-align: left;
}

.key-fact {
  background-color: var(--color-peach);
  border-radius: var(--radius-3);
  padding: var(--space-4);
}

.key-fact dt {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  color: var(--color-burgundy-red);
  margin-bottom: var(--space-2);
}

.key-fact dd {
  margin: 0;
  font-size: var(--font-size-0);
  line-height: var(--font-lineheight-3);
}

.hero-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

/* CTA buttons */
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

.cta-note {
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin: 0;
}

/* Section common */
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
  margin-block: var(--space-6) var(--space-4);
}

/* Questions */
.questions-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.questions-list {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.questions-list li {
  position: relative;
  padding-left: var(--space-6);
  margin-bottom: var(--space-4);
  font-size: var(--font-size-1);
}

.questions-list li::before {
  content: "?";
  position: absolute;
  left: 0;
  color: var(--color-burgundy-red);
  font-weight: var(--font-weight-7);
  font-size: var(--font-size-2);
  line-height: 1;
}

.questions-conclusion {
  max-width: var(--size-content-2);
  margin-inline: auto;
  padding: var(--space-5);
  background-color: var(--color-peach);
  border-radius: var(--radius-3);
  text-wrap: pretty;
}

/* Children / parents */
.children-section {
  background-color: white;
  padding-block: var(--section-padding);
}

.parents-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.check-list {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.check-list li {
  position: relative;
  padding-left: var(--space-5);
  margin-bottom: var(--space-3);
}

.check-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--color-forest-green);
  font-weight: bold;
}

/* Format */
.format-section {
  background-color: white;
  padding-block: var(--section-padding);
}

.format-list {
  list-style: none;
  padding: 0;
  max-width: var(--size-content-2);
  margin-inline: auto;
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

.format-section .subsection-title {
  max-width: var(--size-content-2);
  margin-inline: auto;
}

.parts-list {
  max-width: var(--size-content-2);
  margin-inline: auto;
  padding-left: var(--space-5);
}

.parts-list li {
  margin-bottom: var(--space-3);
  padding-left: var(--space-2);
}

.parts-list li::marker {
  color: var(--color-burgundy-red);
  font-weight: var(--font-weight-7);
}

.format-note {
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-top: var(--space-6);
  font-size: var(--font-size-0);
  color: var(--text-2);
}

/* Lecturer */
.lecturer-section {
  background-color: var(--surface-1);
  padding-block: var(--section-padding);
}

.lecturer-section p {
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-4);
}

.lecturer-intro {
  font-size: var(--font-size-1);
}

.lecturer-quote {
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-block: var(--space-5);
  padding: var(--space-5);
  background-color: white;
  border-left: 4px solid var(--color-burgundy-red);
  border-radius: var(--radius-3);
  font-style: italic;
}

.lecturer-quote p {
  margin-bottom: 0;
}

/* Pricing */
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
  font-size: var(--font-size-4);
  font-weight: 700;
  margin: 0;
}

.price-original {
  display: block;
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-4);
  text-decoration: line-through;
  opacity: 0.8;
}

.price-details {
  font-size: var(--font-size-0);
  max-width: var(--size-content-2);
  margin-bottom: var(--space-3);
}

.pricing-section .cta-note {
  color: rgb(255 255 255 / 80%);
}

/* Capacity */
.capacity-section {
  background-color: white;
  padding-block: var(--section-padding);
  text-align: center;
}

.capacity-text,
.capacity-contact {
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-bottom: var(--space-4);
}

.capacity-outro {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  color: var(--color-forest-green);
}

/* Responsive */
@media (--md-n-below) {
  .key-facts {
    grid-template-columns: 1fr;
  }
}

@media (--sm-n-below) {
  .live-course-promo {
    --section-padding: var(--space-6);
  }

  .hero {
    padding-block: var(--space-6);
  }

  .hero h1 {
    font-size: var(--font-size-3);
  }

  .section-title {
    font-size: var(--font-size-3);
  }
}
</style>
