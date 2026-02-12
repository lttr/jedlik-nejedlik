---
status: active
---

# Nejedlíci page - plan

1. **nejedlik.vue** - Replace stub with full page content from spec. Structure: header, intro, "kdy se obracejí" list, "společně zpět" section, "jak pracujeme" values, "co očekávat", "jak probíhá" with pricing, newsletter form at end
2. **NewsletterForm.vue** - Add optional props: `title`, `description`, `highlight`, `redirectPath` (default `/dekujeme-za-zajem-o-newsletter`). Existing usage unchanged
3. **dekujeme-za-zajem-o-newsletter.vue** - Read `?pdf` query param. When present, show PDF download button with asset URL. Map param to asset ID + label
4. **Verify** - lint, typecheck, build
