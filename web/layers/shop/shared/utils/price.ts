// The one place a price becomes text (spec, "Price"): a price typed into
// copy or a component is a defect. `price_czk` is whole koruny, so there is
// nothing to round.
//
// Both spaces are U+00A0 on purpose. Czech groups thousands with a
// non-breaking space and never separates a number from its unit, and a plain
// space would let a line break inside „1 490 Kč". Hand-rolled rather than
// `Intl.NumberFormat("cs-CZ")` so the output does not depend on the ICU data
// of whichever runtime renders it.
const NON_BREAKING_SPACE = " "

export function formatPriceCzk(priceCzk: number): string {
  const grouped = String(priceCzk).replaceAll(/\B(?=(\d{3})+(?!\d))/g, NON_BREAKING_SPACE)
  return `${grouped}${NON_BREAKING_SPACE}Kč`
}
