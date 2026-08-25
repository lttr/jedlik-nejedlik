import { describe, expect, it } from "vitest"
import { objectFromFormData } from "../../app/utils/forms"

describe("objectFromFormData", () => {
  it("converts string entries to a plain object", () => {
    const fd = new FormData()
    fd.append("name", "Jedlík")
    fd.append("email", "jedlik@example.com")
    expect(objectFromFormData(fd)).toEqual({ name: "Jedlík", email: "jedlik@example.com" })
  })

  it("uses the file name for file entries", () => {
    const fd = new FormData()
    fd.append("attachment", new File(["x"], "menu.pdf"))
    expect(objectFromFormData(fd)).toEqual({ attachment: "menu.pdf" })
  })

  it("keeps the last value for repeated keys", () => {
    const fd = new FormData()
    fd.append("meal", "snídaně")
    fd.append("meal", "oběd")
    expect(objectFromFormData(fd)).toEqual({ meal: "oběd" })
  })
})
