import { describe, expect, it } from "vitest"

import { formatLessonCount } from "../../layers/shop/shared/utils/lesson-count"

const NBSP = " "

describe("formatLessonCount", () => {
  it.each([
    [1, `1${NBSP}lekce`],
    [2, `2${NBSP}lekce`],
    [4, `4${NBSP}lekce`],
    [5, `5${NBSP}lekcí`],
    [12, `12${NBSP}lekcí`],
    [0, `0${NBSP}lekcí`],
  ])("renders %i with the Czech plural form", (count, expected) => {
    expect(formatLessonCount(count)).toBe(expected)
  })
})
