import { NON_BREAKING_SPACE } from "./typography"

// The one place a price becomes text; both spaces are U+00A0 on purpose.
// See docs/shop.md, „Price".
export function formatPriceCzk(priceCzk: number): string {
  const grouped = String(priceCzk).replaceAll(/\B(?=(\d{3})+(?!\d))/g, NON_BREAKING_SPACE)
  return `${grouped}${NON_BREAKING_SPACE}Kč`
}
