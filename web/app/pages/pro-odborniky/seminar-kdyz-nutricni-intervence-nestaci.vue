<template>
  <PageWrapper root-element="article" class="seminar-page p-prose">
    <p>
      <NuxtLink to="/pro-odborniky/lekari">&larr; Lékaři a&nbsp;nutriční terapeuté</NuxtLink>
    </p>

    <header class="hero p-not-prose">
      <p class="eyebrow">Jednodenní seminář pro odborníky</p>
      <h1>Když nutriční intervence nestačí</h1>
      <p class="hero-lead">
        Seminář pro lékaře a&nbsp;nutriční terapeuty o&nbsp;vybíravém jedení, poruchách příjmu
        potravy v&nbsp;mladším školním věku a&nbsp;tzv. nejedlících s&nbsp;obezitou.
      </p>

      <dl class="key-facts">
        <div v-for="fact of keyFacts" :key="fact.label" class="key-fact">
          <dt><Icon :name="fact.icon" /> {{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>

      <a href="#prihlaska" class="cta-button">Přihlásit se na seminář</a>
    </header>

    <section class="intro">
      <div class="vignettes p-not-prose">
        <p class="vignette">
          Dítě odmítá nové potraviny. Jí jen několik oblíbených jídel. Potřebuje při jídle pohádku,
          vyhýbá se určitým konzistencím, dávivě reaguje na sousta nebo se jeho jídelníček postupně
          zužuje.
        </p>
        <p class="vignette">
          Jiné dítě má obezitu, ale přesto přijímá jen velmi omezený výběr potravin. Doporučení ke
          změně jídelníčku tak nemusí fungovat, přestože se rodina snaží spolupracovat.
        </p>
      </div>

      <p class="key-question">
        Kdy jde o&nbsp;běžnou vybíravost, kdy o&nbsp;obtíže vyžadující odborné vyšetření a&nbsp;kdy
        nerozpoznané bariéry brání úspěšné intervenci?
      </p>

      <p>
        Za podobnými projevy mohou stát velmi odlišné příčiny. Od přirozené potravinové neofobie
        přes senzorické a&nbsp;oromotorické obtíže až po zdravotní onemocnění, pediatric feeding
        disorder (PFD) nebo ARFID.
      </p>

      <p class="p-base-text-bold">
        Naučte se rozpoznávat rozdíly, které rozhodují o&nbsp;správné péči.
      </p>

      <p>
        Během jednoho dne propojíme odborné poznatky s&nbsp;konkrétními situacemi z&nbsp;pediatrické
        a&nbsp;nutriční praxe. Zaměříme se na to, jak dítě vyšetřit, na co se rodičů ptát, které
        příznaky nepřehlédnout a&nbsp;jak rozhodovat o&nbsp;dalším postupu.
      </p>
    </section>

    <section>
      <h2>Pro koho je kurz určen?</h2>

      <div class="audience p-not-prose">
        <div class="audience-card">
          <Icon name="uil:stethoscope" class="audience-icon" />
          <p>
            Kurz je připraven
            <strong
              >pro praktické lékaře pro děti a&nbsp;dorost, lékaře dalších odborností, kteří se
              setkávají s&nbsp;obtížemi dětského stravování, a&nbsp;nutriční terapeuty</strong
            >
            pracující s&nbsp;dětskými pacienty.
          </p>
        </div>
        <div class="audience-card">
          <Icon name="uil:heart-medical" class="audience-icon" />
          <p>
            Vhodný je také
            <strong>pro odborníky, kteří se věnují léčbě dětské nadváhy a&nbsp;obezity</strong>
            a&nbsp;chtějí lépe rozpoznávat obtíže, které mohou komplikovat zavádění výživových
            doporučení.
          </p>
        </div>
      </div>
    </section>

    <section>
      <h2>Co si z&nbsp;kurzu odnesete?</h2>

      <ul class="outcomes p-not-prose">
        <li v-for="outcome of outcomes" :key="outcome.title">
          <Icon name="uil:check-circle" class="outcome-icon" />
          <div>
            <strong>{{ outcome.title }}</strong>
            {{ outcome.text }}
          </div>
        </li>
      </ul>
    </section>

    <section>
      <h2>Program kurzu</h2>

      <ProgramTimeline :program class="p-not-prose" />
    </section>

    <section>
      <h2>Seminářem vás provedou</h2>

      <ul class="lecturers p-not-prose">
        <li v-for="lecturer of lecturers" :key="lecturer.name">
          <span class="lecturer-name">{{ lecturer.name }}</span>
          <span class="lecturer-role">{{ lecturer.role }}</span>
        </li>
      </ul>
    </section>

    <section>
      <h2>Praktické informace</h2>

      <dl class="practical p-not-prose">
        <div v-for="item of practicalInfo" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>

      <p class="question-note">
        <Icon name="uil:envelope" />
        <span>
          Chcete se k&nbsp;semináři na něco zeptat? Napište nám na
          <a href="mailto:info@jedlik-nejedlik.cz">info@jedlik-nejedlik.cz</a>.
        </span>
      </p>
    </section>

    <section id="prihlaska" class="signup p-not-prose">
      <h2>Přihláška na seminář</h2>
      <p class="signup-facts">
        <span>19.&nbsp;února 2027</span>
        <span>Hradec Králové</span>
        <span>3&nbsp;400&nbsp;Kč</span>
      </p>
      <WaitlistCourseForm
        course="seminar-nutricni-intervence-2027-02"
        submit-label="Přihlásit se na seminář"
        success-message="Děkujeme za přihlášku! Ozveme se vám e-mailem s&nbsp;dalšími informacemi."
      />
    </section>
  </PageWrapper>
</template>

<script lang="ts" setup>
import type { ProgramBlock } from "~/components/ProgramTimeline.vue"
import ProgramTimeline from "~/components/ProgramTimeline.vue"
import WaitlistCourseForm from "~/components/WaitlistCourseForm.vue"
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"

const nbsp = " "

const keyFacts = [
  { icon: "uil:calendar-alt", label: "Termín", value: `19.${nbsp}února 2027` },
  { icon: "uil:clock", label: "Čas", value: "9.00–17.30" },
  { icon: "uil:map-marker", label: "Místo", value: `Hradec Králové` },
  { icon: "uil:money-bill", label: "Cena", value: `3${nbsp}400${nbsp}Kč` },
]

const outcomes = [
  {
    title: "Porozumíte tomu, jak se dítě učí jíst.",
    text: `Jak se vyvíjí kousání, žvýkání, polykání, samostatné jedení i${nbsp}přijímání nových potravin a${nbsp}konzistencí.`,
  },
  {
    title: "Dokážete lépe odlišit běžnou vybíravost od závažnějších obtíží.",
    text: `Zorientujete se v${nbsp}pojmech potravinová neofobie, PFD, ARFID a${nbsp}dalších poruch příjmu potravy.`,
  },
  {
    title: "Získáte strukturu pro vstupní vyšetření.",
    text: `Budete vědět, na co se ptát, čeho si všímat a${nbsp}jaké informace jsou důležité při posuzování nutričních, zdravotních i${nbsp}psychosociálních rizik.`,
  },
  {
    title: `Naučíte se rozpoznávat nejedlictví u${nbsp}dětí s${nbsp}obezitou.`,
    text: `Pochopíte, proč doporučované změny jídelníčku nemusí být pro některé děti aktuálně realizovatelné a${nbsp}jak tuto skutečnost zohlednit při plánování intervence.`,
  },
  {
    title: "Naučíte se rozpoznávat varovné příznaky.",
    text: `Kdy dítě sledovat v${nbsp}rámci běžné péče, kdy doporučit mezioborové vyšetření a${nbsp}kdy je nutné neodkladné zdravotní řešení.`,
  },
  {
    title: "Lépe porozumíte kompetencím dalších odborníků.",
    text: "Budete vědět, kdy zapojit do intervence klinického logopeda, ergoterapeuta, psychologa, psychiatra nebo další zdravotnické specialisty.",
  },
  {
    title: "Procvičíte si rozhodování na kazuistikách.",
    text: `Propojíte získané informace s${nbsp}konkrétními situacemi, které můžete řešit ve své ambulanci.`,
  },
]

const program: ProgramBlock[] = [
  {
    time: "9.00–9.15",
    title: "Úvod – Když výživová doporučení nestačí",
    description: `Představíme cíle kurzu, rozdílné kompetence pediatra a${nbsp}nutričního terapeuta a${nbsp}nejčastější slepé uličky při prvním kontaktu s${nbsp}rodinou dítěte.`,
  },
  {
    time: "9.15–10.15",
    title: "Jak se dítě učí jíst",
    description: `Jak se vyvíjejí dovednosti potřebné k${nbsp}jídlu, přijímání různých konzistencí a${nbsp}ochota ochutnávat nové potraviny? Vysvětlíme si roli senzorického zpracování, oromotorických schopností a${nbsp}zkušeností dítěte a${nbsp}ukážeme, co je ještě běžnou součástí vývoje.`,
  },
  { time: "10.15–10.30", title: "Přestávka", isBreak: true },
  {
    time: "10.30–12.00",
    title: `Vybíravost, PFD, ARFID a${nbsp}další poruchy: jak se v${nbsp}nich vyznat?`,
    description: `Naučíte se rozlišovat běžnou vybíravost, potravinovou neofobii, PFD, ARFID a${nbsp}další poruchy příjmu potravy i${nbsp}zdravotní příčiny odmítání jídla.`,
  },
  { time: "12.00–12.45", title: "Přestávka na oběd", isBreak: true },
  {
    time: "12.45–13.45",
    title: `Jak stanovit priority intervence u${nbsp}dítěte, které „nejí“?`,
    description: `Projdeme praktický postup vstupního vyšetření v${nbsp}pediatrické ordinaci a${nbsp}nutriční ambulanci, ukážeme si nástroje, které nám mohou pomoci efektivně ohledat situaci.`,
  },
  {
    time: "13.45–14.15",
    title: `Nejedlík s${nbsp}obezitou: Skrytá překážka úspěšné léčby`,
    description: `Ukážeme si, jak intervenovat u${nbsp}dítěte s${nbsp}obezitou, jak obtíže rozpoznat, odlišit možné příčiny a${nbsp}navrhovat realistické změny, které odpovídají schopnostem dítěte.`,
  },
  { time: "14.15–14.30", title: "Přestávka", isBreak: true },
  {
    time: "14.30–15.45",
    title: `Dítě, které nechce jíst, a${nbsp}dítě, které jíst nedokáže`,
    description: `Zaměříme se na typické projevy, varovné příznaky a${nbsp}situace, ve kterých je vhodné zapojit klinického logopeda, ergoterapeuta nebo další odborníky.`,
  },
  {
    time: "15.45–17.00",
    title: "Kazuistická část",
    description: `Praktický rozbor kazuistik a${nbsp}video ukázek. Získané poznatky si procvičíte na praktických kazuistikách.`,
  },
  { time: "17.00–17.30", title: "Závěrečná část, diskuze" },
]

const lecturers = [
  {
    name: `Mgr.${nbsp}et Mgr.${nbsp}Zdeňka Trummová`,
    role: "pedagog, výživová poradkyně, studentka nutriční terapie",
  },
  { name: `Mgr.${nbsp}Markéta Koželská`, role: "ergoterapeutka" },
  { name: `Mgr.${nbsp}Barbora Šimonová`, role: "klinická logopedka" },
]

const practicalInfo = [
  { label: "Termín", value: `19.${nbsp}února 2027` },
  { label: "Čas", value: "9.00–17.30" },
  { label: "Místo", value: "Hradec Králové (místo bude upřesněno)" },
  {
    label: "Pro koho",
    value: `Lékaři a${nbsp}nutriční terapeuti pracující s${nbsp}dětskými pacienty`,
  },
  {
    label: "Cena",
    value: `3${nbsp}400${nbsp}Kč (v${nbsp}ceně jsou zahrnuty dopolední a${nbsp}odpolední svačina, nápoje a${nbsp}tištěné materiály; oběd je možné zajistit za příplatek)`,
  },
  { label: "Pořadatel", value: `Jedlík-nejedlík, z.${nbsp}s.` },
]

useSeoMeta({
  title: "Seminář Když nutriční intervence nestačí – pro lékaře a nutriční terapeuty",
  description:
    "Jednodenní seminář 19. 2. 2027 v Hradci Králové o vybíravém jedení, PFD, ARFID a nejedlících s obezitou. Pro pediatry, lékaře a nutriční terapeuty.",
})
</script>

<style scoped>
.seminar-page {
  --accent: var(--color-forest-green);
  --accent-soft: color-mix(in srgb, var(--color-light-lime) 45%, white);
  --warm-soft: color-mix(in srgb, var(--color-peach) 70%, white);

  & > section {
    margin-top: var(--space-8);
  }
}

/* Hero */
.hero {
  display: grid;
  justify-items: start;
  gap: var(--space-4);
  padding-block: var(--space-4) var(--space-6);

  & h1 {
    margin: 0;
    text-wrap: balance;
  }
}

.eyebrow {
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-burgundy-red);
}

.hero-lead {
  font-size: var(--font-size-2);
  line-height: var(--font-lineheight-3);
  text-wrap: pretty;

  @media (--sm-n-below) {
    font-size: var(--font-size-1);
  }
}

.key-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14ch, 1fr));
  gap: var(--space-3);
  width: 100%;
  margin-block: var(--space-2);
}

.key-fact {
  padding: var(--space-3) var(--space-4);
  background: var(--warm-soft);
  border-radius: var(--radius-3);

  & dt {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--font-size-0);
    font-weight: var(--font-weight-6);
    color: var(--color-burgundy-red);
  }

  & dd {
    margin: var(--space-1) 0 0;
    font-weight: var(--font-weight-6);
  }
}

.cta-button {
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-round);
  background: var(--color-light-lime);
  color: var(--accent);
  font-weight: var(--font-weight-6);
  text-decoration: none;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-3);
  }
}

/* Intro */
.vignettes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(28ch, 1fr));
  gap: var(--space-4);
}

.vignette {
  padding: var(--space-4) var(--space-5);
  background: var(--surface-2);
  border-radius: var(--radius-3);
  font-style: italic;
  text-wrap: pretty;
}

.key-question {
  padding-left: var(--space-4);
  border-left: 4px solid var(--accent);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  line-height: var(--font-lineheight-2);
  color: var(--accent);
  text-wrap: pretty;
}

/* Audience */
.audience {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(28ch, 1fr));
  gap: var(--space-4);
}

.audience-card {
  display: grid;
  gap: var(--space-2);
  align-content: start;
  padding: var(--space-5);
  border: var(--border-3);
  border-radius: var(--radius-3);
}

.audience-icon {
  font-size: var(--font-size-5);
  color: var(--accent);
}

/* Outcomes */
.outcomes {
  display: grid;
  gap: var(--space-3);
  padding: 0;
  list-style: none;

  & li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--accent-soft);
    border-radius: var(--radius-3);
  }

  & strong {
    display: block;
  }
}

.outcome-icon {
  margin-top: 0.15em;
  font-size: var(--font-size-3);
  color: var(--accent);
}

/* Lecturers */
.lecturers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(22ch, 1fr));
  gap: var(--space-3);
  padding: 0;
  list-style: none;

  & li {
    display: grid;
    gap: var(--space-1);
    align-content: start;
    padding: var(--space-4);
    background: var(--warm-soft);
    border-radius: var(--radius-3);
  }
}

.lecturer-name {
  font-weight: var(--font-weight-6);
}

.lecturer-role {
  font-size: var(--font-size-0);
  color: var(--text-2);
}

/* Practical info */
.practical {
  display: grid;
  border-top: 1px solid var(--surface-3);

  & div {
    display: grid;
    grid-template-columns: 12ch 1fr;
    gap: var(--space-4);
    padding-block: var(--space-3);
    border-bottom: 1px solid var(--surface-3);

    @media (--sm-n-below) {
      grid-template-columns: 1fr;
      gap: var(--space-1);
    }
  }

  & dt {
    font-weight: var(--font-weight-6);
  }

  & dd {
    margin: 0;
  }
}

.question-note {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  font-weight: var(--font-weight-6);
}

/* Signup */
.signup {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-7) var(--space-4);
  background: var(--accent-soft);
  border-radius: var(--radius-4);
  scroll-margin-top: var(--space-6);
  text-align: center;

  & h2 {
    margin: 0;
  }
}

.signup-facts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-1) var(--space-4);
  margin-bottom: var(--space-3);
  font-weight: var(--font-weight-6);
  color: var(--accent);
}
</style>
