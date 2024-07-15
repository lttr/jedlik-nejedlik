<template>
  <div class="main p-container p-flow">
    <header class="p-center">
      <h1>Styleguide</h1>
    </header>
    <section>
      <h2>Logo</h2>
      <div class="p-cluster">
        <SvgoLogoTwoline class="logo" />
        <SvgoLogoOneline class="logo" />
        <SvgoLogomark class="logomark" />
        <SvgoLogomark class="logomark-inside" />
      </div>
    </section>
    <section class="p-flow">
      <h2>Barvy</h2>
      <div class="p-flow">
        <div class="colors p-cluster">
          <div v-for="color of colors1" :key="color">
            <span class="p-secondary-text-regular">{{ color }}</span>
            <div
              class="color-box"
              :style="`background-color: var(--${color});`"
            ></div>
          </div>
        </div>
        <div class="colors p-cluster">
          <div v-for="color of colors2" :key="color">
            <span class="p-secondary-text-regular">{{ color }}</span>
            <div
              class="color-box"
              :style="`background-color: var(--${color});`"
            ></div>
          </div>
        </div>
      </div>
    </section>
    <section class="p-flow">
      <h2>Text</h2>
      <h1>Nadpis první úrovně</h1>
      <p>Primární text</p>
      <p class="narrow">
        In hac habitasse platea dictumst. Nullam malesuada molestie lorem. Nunc
        non mauris. Nam accumsan tortor gravida elit. Cras porttitor. Praesent
        vel enim sed eros luctus imperdiet.
      </p>
      <h2>Nadpis druhé úrovně</h2>
      <p class="p-secondary-text-regular">Sekundární text</p>
      <p class="p-secondary-text-regular">
        Morbi dictum, sem sit amet aliquam euismod, odio tortor pellentesque
        odio, ac ultrices enim nibh sed quam. Integer tortor velit, condimentum
        a, vestibulum eget, sagittis nec, neque. Aenean est urna, bibendum et,
        imperdiet at, rhoncus in, arcu. In hac habitasse platea dictumst.
        Vestibulum blandit dignissim dui. Maecenas vitae.
      </p>
      <h3>Nadpis třetí úrovně</h3>
      <div class="p-cluster">
        Morbi dictum, sem sit amet aliquam euismod, odio tortor pellentesque
        odio, ac ultrices enim nibh sed quam. Integer tortor velit, condimentum
        a, vestibulum eget, sagittis nec, neque. Aenean est urna, bibendum et,
        imperdiet at, rhoncus in, arcu. In hac habitasse platea dictumst.
        Vestibulum blandit dignissim dui. Maecenas vitae.
      </div>
    </section>
    <section class="p-flow">
      <h2>Obrázky</h2>
      <div class="svgs p-cluster">
        <SvgoHruska />
        <SvgoBoruvky />
        <SvgoJablko />
        <SvgoJahoda />
        <SvgoStopka />
        <SvgoMrkev />
        <SvgoSpirala />
      </div>
    </section>
    <section class="p-flow">
      <h2>Ikony</h2>
      <div class="p-cluster">
        <Icon name="uil:arrow-right" />
        <Icon name="uil:arrow-left" />
        <Icon name="uil:multiply" />
        <Icon name="uil:bars" />
        <Icon name="uil:file-download" />
        <Icon name="uil:shopping-cart" />
        <Icon name="uil:facebook" />
        <Icon name="uil:instagram" />
      </div>
    </section>
    <section class="p-flow">
      <h2>Tlačítka</h2>
      <div class="p-cluster">
        <button class="p-button">Semináře</button>
        <button class="p-secondary">Přihlásit se</button>
      </div>
    </section>
    <section class="p-flow">
      <h2>Tagy</h2>
      <div class="p-cluster">
        <Chip to="/">online</Chip>
        <Chip to="/">labužník</Chip>
      </div>
    </section>
    <section class="p-flow">
      <h2>Karta - článek</h2>
      <ArticleCard v-bind="exampleCard" />
    </section>
    <section class="p-flow">
      <h2>Karta - kontakt</h2>
      <div class="contacts-card p-stack">
        <h3>Jedlík nejedlík</h3>
        <section class="p-flow">
          <div>
            <h4 class="subheading">Poradna</h4>
            <div>
              Velká 22<br />
              Praha 10<br />
              Česká republika
            </div>
          </div>
          <div>
            <h4 class="subheading">telefon</h4>
            <a href="">+420 123 456 789</a>
          </div>
          <div>
            <h4 class="subheading">email</h4>
            <a href="">info@jedlik-nejedlik-cz</a>
          </div>
        </section>
        <button class="p-button">Kontaktovat</button>
      </div>
    </section>
    <section class="p-flow">
      <h2>Patička</h2>
      <div class="footer">
        <div class="p-stack">
          <div class="footer-heading">kontakt</div>
          <p>123 456 789</p>
          <div><a href="/">O nás</a></div>
          <div><a href="/">FAQ</a></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
const colors1 = [
  "color-navy",
  "color-peach",
  "color-forest-green",
  "color-pale-blue",
  "color-light-lime",
  "color-orange-soda",
]
const colors2 = [
  "brand-color-dim",
  "brand-color",
  "brand-color-bright",
  "color-midnight",
]

const exampleCard = {
  image: "/child-placeholder.webp",
  to: "/",
  tags: [
    { text: "jedlík", to: "/" },
    { text: "nejedlík", to: "/" },
  ],
  title: "Jedlík nejedlík",
  text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam id dolor. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Aliquam erat volutpat.",
  ctaText: "Přihlásit se",
  headingLevel: "h2" as const,
}
</script>

<style scoped>
.main {
  margin-block: var(--space-5);
}

section > h2:first-child {
  margin-top: var(--space-6);
}

.logo {
  width: 300px;
  padding: var(--space-4);
}

.logomark {
  width: 100px;
  padding: var(--space-4);
  margin: var(--space-4);
}

.logomark-inside {
  width: 100px;
  padding: var(--space-4);
  margin: var(--space-4);
  color: var(--color-peach);
  background-color: var(--color-navy);
}

.colors {
  max-width: 900px;

  .color-box {
    width: 180px;
    height: 180px;
    color: white;
    display: grid;
    place-items: center;
  }
}

.narrow {
  max-width: var(--size-content-2);
}

.svgs {
  max-width: 70ch;
}

.svgs > * {
  width: 170px;
  max-height: 200px;
}

.contacts-card {
  padding-block: var(--space-6);
  padding-inline: var(--space-5);
  max-width: var(--size-content-2);
  border-radius: var(--radius-4);
  box-shadow: var(--shadow-4);

  font-size: var(--font-size--1);

  h3 {
    font-size: var(--font-size-1);
  }

  .subheading {
    margin-bottom: var(--space-1);
    font-size: var(--font-size--2);
    font-weight: var(--font-weight-6);
  }

  button {
    width: fit-content;
  }
}

.footer {
  color: var(--text-color-1-inverse);
  background-color: var(--color-midnight);
  padding: var(--space-4);

  > * {
    --stack-space: var(--space-2);
  }

  .footer-heading {
    font-size: var(--font-size--2);
    color: var(--text-color-2-inverse);
  }

  a {
    font-size: var(--font-size--1);
    text-decoration: none;
    color: var(--text-color-1-inverse);
  }
}
</style>
