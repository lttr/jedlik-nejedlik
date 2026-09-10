# Poznámka pro marketéra — Meta Pixel na jedlik-nejedlik.cz

Návrh textu k odeslání. Pixel `3144448269086284` je na webu nasazený, níže je,
co se oproti zaslanému kódu změnilo a proč.

---

Dobrý den,

Meta Pixel je na webu nasazený a měří dvě události. Shrnuji, co je jinak oproti
kódu, který jste poslali, ať Vás čísla v Events Manageru nepřekvapí.

**Zaslaný úryvek by se sám o sobě nespustil.** Jsou v něm typografické
uvozovky („smart quotes“), které prohlížeč nebere jako uvozovky v kódu —
skončilo by to chybou `SyntaxError` a neodešla by ani jedna událost. Nejspíš to
udělal textový editor při kopírování. Kód na webu je proto psaný přímo v našem
projektu, ne vložený.

**`content_type: 'kurz'` není platná hodnota.** Meta u tohoto parametru
očekává `product` nebo `product_group`; cokoli jiného ignoruje, případně to
brání spárování s katalogem. Kurz proto neposíláme přes `content_type`, ale
jako `content_name` s naším vlastním identifikátorem kurzu:

- `online-3-7-2027-01` — Online kurz pro rodiče dětí 3–7 let (start 11. 1. 2027)
- `nazivo-2-5-hk-2026-10` — Kurz (ne)hubnutí naživo 2.–5. třída, Hradec Králové
  (start 5. 10. 2026)
- `nazivo-6-9-hk-2026-09` — Kurz (ne)hubnutí naživo 6.–9. třída, Hradec Králové
  (start 22. 9. 2026)

**`Purchase` nově znamená zaplacenou objednávku, ne kliknutí na tlačítko.**
V původním návrhu se `Purchase` odesílal už při kliknutí na „Chci se
přihlásit“. To by jako nákup počítalo i všechny, kdo klikli a nezaplatili, a
Meta by pak optimalizovala rozpočet na lidi, kteří klikají a nekupují.
Nově to je rozdělené:

- **`InitiateCheckout`** — kliknutí na tlačítko, tedy odchod do SimpleShopu.
- **`Purchase`** — až návrat ze SimpleShopu po zaplacení, na naši vlastní
  děkovací stránku. Odesílá se jednou za návštěvu, takže obnovení stránky
  nákup nezdvojí.

Obě události nesou identifikátor kurzu, takže v Events Manageru uvidíte
trychtýř po jednotlivých kurzech. Hodnotu ani cenu (`value`, `currency`)
zatím neposíláme — u online kurzu se dá platit na splátky, takže by částka
byla zavádějící. Až bude potřeba obratové reportování, doplníme.

**Měříme jen návštěvníky, kteří souhlasili s cookies.** Web nově zobrazuje
lištu se souhlasem. Dokud návštěvník neklikne na „Přijmout“, neodejde k Metě
ani požadavek na načtení pixelu — ne že by se událost jen zahodila. Kdo
odmítne, měřený není vůbec. Čísla v Events Manageru proto budou nižší než
skutečná návštěvnost a nižší než v Plausible (ten je bez cookies a měří
všechny). Je to podmínka, aby nasazení bylo v souladu s GDPR.

**Pixel běží jen na ostrém webu** (`www.jedlik-nejedlik.cz`), ne na testovacím
prostředí, aby data z vývoje neznečišťovala reklamní účet.

**Prosím o ověření na Vaší straně.** V Events Manageru → Test Events se dá
projít celý trychtýř: načtení stránky (`PageView`), kliknutí na tlačítko
kurzu (`InitiateCheckout`) a děkovací stránka (`Purchase`). U `Purchase` je
potřeba skutečně zaplacená objednávka — plánujeme testovací objednávku, kterou
následně stornujeme, jakmile potvrdíte, že příjem událostí na straně Mety je
připravený.

S pozdravem
