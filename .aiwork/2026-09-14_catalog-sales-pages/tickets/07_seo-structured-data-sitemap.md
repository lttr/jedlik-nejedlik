---
status: done
verified: [checks, behaviour]
blocked_by: [04]
references:
  - "Spec: ../spec.md"
---

# 07 — Metadata, structured data and sitemap

**What to build:** a shared link to a Sales Page shows the Course title, teaser and cover as its preview, and search engines can index every published Course with its price without a deploy.

- Meta title and description derive from title and teaser; the social image is the cover taken through a Directus image transformation at 1200×630; one canonical URL per Course. No SEO fields are added to `course`.
- Structured data via the schema.org helpers bundled with `@nuxtjs/seo`: a Course entity with an offers block carrying the price in CZK on the Sales Page, breadcrumbs on both pages, an item list on the Catalog. No Product entity. Provider from the existing site configuration.
- The sitemap gains a runtime source listing published Course URLs, served by a Nitro route using the anonymous client only.

## Acceptance criteria

- [x] Sales Page head carries title, description, og:image (1200×630 cover transform) and canonical URL
- [x] JSON-LD: Course + offers (price, CZK) on the Sales Page; breadcrumbs on both pages; ItemList on the Catalog; validates in a structured-data checker (offline: JSON parse + shape assertions; Google's Rich Results Test remains for a human)
- [x] `sitemap.xml` lists published Course URLs and reflects a newly published Course without a deploy; drafts never appear
- [x] Verified in the running app by inspecting head and JSON-LD for the fixture Course
- [x] `vp run check:all` passes
