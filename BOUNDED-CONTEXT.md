# Course Platform (Platforma kurzů)

Sells digital video courses to Czech consumers and delivers the learning
experience: purchase, entitlement, gated progression through sections, and
secure video access. Issues invoices on behalf of Jedlík-nejedlík, z. s.

## Boundary

**Inside:** course catalog, the buy→pay→grant flow, per-student entitlement and
progress, section unlock rules, the test module, secure video delivery,
invoicing.

**Outside (deliberately):** physical products / shipping / stock; subscriptions
& recurring payments; B2B / multi-seat licences; multi-currency; non-Czech UI;
catalog search & recommendations; completion certificates. Also outside: the
existing marketing site, which is a separate concern this context sits beside.

**External systems:** Directus, GoPay, Fakturoid, Cloudflare Stream (video), a
transactional email provider.

## Integration

- **Directus** — system of record (content and transactional data) and the
  identity / auth provider; its permissions are the primary access gate.
- **Nitro (this app)** — trusted compute for secret-holding / server-side
  operations; reads and writes Directus, never a second store of record.
- **GoPay** — payment; its notification is what marks an Order paid.
- **Fakturoid** — invoicing; owns the invoice number series and DPH handling.

## Language

**Course** (Kurz):
A purchasable digital product made of Sections.
_Avoid_: product (reserve for a future generic sellable), e-shop item.

**Section** (Sekce):
An ordered group of Lessons within a Course; the unit that carries an Unlock
Rule.
_Avoid_: module, chapter.

**Lesson** (Lekce):
A leaf within a Section: a video plus optional Materials.
_Avoid_: unit, episode.

**Asset** (Podklad):
A media file used by a Lesson. A **video Asset** lives in Cloudflare Stream and
is referenced by its UID; a **static Asset** (image, PDF, document) lives in
Directus. The distinction matters because video is streamed and access-gated,
static files are not.
_Avoid_: file, media, upload.

**Material** (Doplňkový materiál):
A downloadable static Asset attached to a Lesson (e.g. a PDF worksheet).
_Avoid_: attachment, resource, handout.

**Asset Ingestion** (Příjem podkladů):
Taking an uploaded Asset and routing it to its correct store (Directus for
static, Cloudflare Stream for video). The capability that backs both the admin
upload page and the upload CLI.
_Avoid_: import, sync.

**Unlock Rule** (Pravidlo odemčení):
The per-Section policy that decides when a Student may enter that Section.
_Avoid_: gate, lock.

**Student** (Student):
The end user who learns; also the buyer. A Directus end-user identity, distinct
from a Directus staff/admin user.
_Avoid_: User (ambiguous with Directus staff), customer, account, member.

**Order** (Objednávka):
A Student's request to buy one Course.
_Avoid_: purchase, transaction, cart.

**Entitlement** (Oprávnění ke kurzu):
A Student's right to access one Course.
_Avoid_: licence, subscription, enrolment.

**Progress** (Postup):
The record of a Student's unlocked and completed Sections within a Course.

**Test** (Test):
A quiz a Section's Unlock Rule may require a Student to pass.
_Avoid_: exam, assessment, task/úkol.

**Test Attempt** (Pokus o test):
One submitted run of a Test by a Student.

**Invoice** (Faktura):
A numbered invoice issued via Fakturoid on behalf of Jedlík-nejedlík, z. s.
_Avoid_: bill, receipt.

### Flagged ambiguities

- **"User" / Uživatel** — resolved: the learner is the **Student**; reserve
  "user" for Directus staff/admin only.
- **"Task" / Úkol** — resolved: not a distinct concept; the only automatic gate
  is a **Test**. Human-reviewed work is manual admin release.
