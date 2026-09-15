# Kurzy

**LMS**:
The bounded context for selling and delivering Courses: identity, catalog,
payment, and test-gated learning. In prose the system is _LMS_ (indeclinable: "v
LMS", "náš LMS"). User-facing, the area is _Kurzy_, and "LMS" never appears in
front of Students.
_Avoid_: Course Platform / platforma kurzů (too grand), e-learning, vzdělávací
portál.

**Course** (Kurz):
An educational programme the client sells. It comes in two forms, and where the
form matters the specific term is used.
_Avoid_: product (reserve for a future generic sellable), e-shop item.

**On-demand Course** (Videokurz):
A Course delivered as a digital product made of Sections in the LMS, watched at
the Student's own pace. The LMS terms below (Section, Lesson, Entitlement, …)
apply to this form.
_Avoid_: online course (ambiguous, because a Live Course can also be online).

**Live Course** (Kurz s lektorem):
A Course led by a lecturer at fixed times, in person ("naživo") or online,
identified by its start date and, in person, its place.
_Avoid_: course run, cohort, term, turnus.

**Catalog** (Nabídka kurzů):
The public list of Courses offered for sale.
_Avoid_: shop, e-shop, offer, listing.

**Sales Page** (Prodejní stránka):
The public page of a single Course that presents it and starts the purchase.
_Avoid_: product page, PDP, detail page, landing page.

**Section** (Sekce):
An ordered group of Lessons within a Course. It is the unit that carries an
Unlock Rule.
_Avoid_: module, chapter.

**Lesson** (Lekce):
A leaf within a Section: a video plus optional Materials.
_Avoid_: unit, episode.

**Asset** (Podklad):
A media file used by a Lesson. A **video Asset** lives in Cloudflare Stream and
is referenced by its UID. A **static Asset** (image, PDF, document) lives in
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

**Account** (Účet):
A Directus identity that can log in to the site, whoever it belongs to: a
Student or a staff Author. What a session represents.
_Avoid_: User (ambiguous with Directus staff), login, profile, member.

**Student** (Student):
The Account that learns and buys. The identity every Order, Entitlement and
Progress record belongs to.
_Avoid_: User (ambiguous with Directus staff), customer, member.

**Author** (Autor):
A staff Account that creates and publishes Course content in Directus.
_Avoid_: admin (a broader role), editor, lecturer, teacher.

**Order** (Objednávka):
A Student's request to buy one Course.
_Avoid_: purchase, transaction, cart.

**Consent** (Souhlas):
A Student's recorded agreement to one legal document at a given version,
attached to an Order. In v1 the only Consent is to the terms; the privacy
policy is information, not a Consent, and no § 1837 waiver is asked for.
_Avoid_: acceptance, checkbox, agreement.

**Billing Details** (Fakturační údaje):
The optional name, company, IČO and address a Student keeps on their Account
and that an Order copies at purchase for the Invoice.
_Avoid_: address, contact, customer data.

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
