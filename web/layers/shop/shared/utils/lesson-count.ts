import { NON_BREAKING_SPACE } from "./typography"

const pluralRules = new Intl.PluralRules("cs")

export function formatLessonCount(count: number): string {
  const form = pluralRules.select(count)
  const noun = form === "one" || form === "few" ? "lekce" : "lekcí"
  return `${count}${NON_BREAKING_SPACE}${noun}`
}
