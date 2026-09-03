---
status: not-started
references:
  - "Legal name source: Simpleshop sender settings, `Jedlík-nejedlík, z. s.`"
  - "Notes: ~/notes/projects/Jedlík nejedlík/Jedlík-nejedlík - e-mail.md"
---

# Unify the organisation name to "Jedlík-nejedlík"

## Problem

The brand name appears in seven spellings across the site and the CMS. The
canonical form is **`Jedlík-nejedlík`** (hyphen, lowercase second word): it is
the Nuxt site name (`web/nuxt.config.ts:48`), the Directus `project_name`
(which the e-mail From header and subjects render), and the legal name of the
association, `Jedlík-nejedlík, z. s.`, as registered in Simpleshop.

Occurrences that deviate:

| Spelling          | Where                                                                         |
| ----------------- | ----------------------------------------------------------------------------- |
| `Jedlík nejedlík` | `web/app/components/homepage/ContactsCard.vue:3`                              |
| `Jedlík nejedlík` | `web/app/components/homepage/LecturesSection.vue:32`                          |
| `Jedlík nejedlík` | `web/app/pages/style.vue:143`                                                 |
| `Jedlík-Nejedlík` | `web/app/pages/pro-odborniky/zrizovatele.vue:71`                              |
| `Jedlík Nejedlík` | `web/app/pages/zasady-zpracovani-osobnich-udaju.vue:16`                       |
| `Jedlik Nejedlik` | Directus settings `org_name` (`directus/config/collections/settings.json:60`) |
| `jedliknejedlik`  | Ecomail account sender name (outside the repo)                                |

## Scope

1. Replace the five copy occurrences in `web/` with `Jedlík-nejedlík`. In the
   privacy policy use the full legal form `Jedlík-nejedlík, z. s.` since that
   sentence names the registered entity.
2. Set Directus `org_name` to `Jedlík-nejedlík` in the admin app (Settings →
   Project), then `vp run directus:pull` so the dump follows. The config
   workflow is pull-only; do not edit `settings.json` by hand.
3. Ecomail: set the campaign sender name to `Jedlík-nejedlík` (per campaign,
   Nastavení → Jméno odesílatele). Manual, outside the repo; record in
   implementation notes when done.
4. Drop the hardcoded `| Jedlík-nejedlík` suffix from the two page titles
   that carry it. `@nuxtjs/seo` already appends the site name from
   `site.name` (`web/nuxt.config.ts:48`) via a default `titleTemplate`, so
   these pages render the name **twice**:

   | File                                          | Current title                                               |
   | --------------------------------------------- | ----------------------------------------------------------- |
   | `web/app/pages/webinar-generace-alfa.vue:233` | `Webinář: Generace alfa u stolu \| Jedlík-nejedlík`         |
   | `web/app/pages/2026-online-kurz-deti.vue:9`   | `Online kurz pro rodiče dětí s nadváhou \| Jedlík-nejedlík` |

   Keep only the page-specific part; the template supplies the rest. Found
   while closing area 02 — see
   `../2026-08-19_auth-customers/implementation-notes.md` ("Confirmed for
   the titleTemplate follow-up"), which estimated ~7 affected pages; a
   grep on 2026-09-03 found these two. `style.vue:143` and
   `LecturesSection.vue:32` carry the bare name with no separator and are
   already covered by item 1.

Out of scope: URL slugs, social handles (`jedliknejedlik` on Forendors,
Instagram etc.), the `jedlik-nejedlik` kebab-case identifiers in code.

## Verification

- `vp run check:all` green.
- `grep -rnE "Jedlík nejedlík|Jedlík-Nejedlík|Jedlík Nejedlík|Jedlik Nejedlik" web/app web/layers directus/config` returns nothing.
- Drive `/`, `/pro-odborniky/zrizovatele` and `/zasady-zpracovani-osobnich-udaju` in the running app and read the rendered name.
- Read the rendered `<title>` of `/webinar-generace-alfa` and
  `/2026-online-kurz-deti`: the name must appear exactly once.
