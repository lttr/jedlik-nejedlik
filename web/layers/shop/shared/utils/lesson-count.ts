import { NON_BREAKING_SPACE } from "./typography"

// The count is a whole number, so `Intl.PluralRules("cs")` only ever answers
// `one`, `few` or `other` here — the two that take „lekce" against the one
// that does not.
const pluralRules = new Intl.PluralRules("cs")

export function formatLessonCount(count: number): string {
  const form = pluralRules.select(count)
  const noun = form === "one" || form === "few" ? "lekce" : "lekcí"
  return `${count}${NON_BREAKING_SPACE}${noun}`
}
