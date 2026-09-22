import { defineAsyncComponent } from "vue"
import type { Component } from "vue"

// Course slug (exactly as Directus holds it) to the component the Sales Page
// mounts between the hero and the outline. A Course absent here is the normal
// state. See docs/shop.md, „Sales content".
const SALES_CONTENT: Record<string, Component> = {
  "test-kurz-publikovany": defineAsyncComponent(
    async () => import("../components/sales/content/TestKurzPublikovany.vue"),
  ),
}

export function resolveSalesContent(
  slug: string,
  registry: Record<string, Component> = SALES_CONTENT,
): Component | null {
  return Object.hasOwn(registry, slug) ? (registry[slug] ?? null) : null
}

// The keys with no Course behind them: a renamed slug or a Course that was
// removed leaves copy nobody can reach. Callers with the full Course list in
// hand (the Catalog page) warn about them in development.
export function orphanSalesContentSlugs(
  courseSlugs: readonly string[],
  registry: Record<string, Component> = SALES_CONTENT,
): string[] {
  return Object.keys(registry).filter((slug) => !courseSlugs.includes(slug))
}
