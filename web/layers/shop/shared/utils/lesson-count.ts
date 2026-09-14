// „1 lekce", „2–4 lekce", „5+ lekcí" (and „0 lekcí"). The count is a whole
// number, so the Czech `one` / `few` / `other` forms are enough. The space
// before the noun is non-breaking: a number never ends a line on its own.
const NON_BREAKING_SPACE = " "

const pluralRules = new Intl.PluralRules("cs")

const LESSON_FORMS: Record<Intl.LDMLPluralRule, string> = {
  one: "lekce",
  few: "lekce",
  many: "lekcí",
  other: "lekcí",
  zero: "lekcí",
  two: "lekce",
}

export function formatLessonCount(count: number): string {
  return `${count}${NON_BREAKING_SPACE}${LESSON_FORMS[pluralRules.select(count)]}`
}
