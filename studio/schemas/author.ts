import { defineField, defineType } from "sanity"

export default defineType({
  name: "author",
  title: "Autor",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Jméno",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Jméno v URL adrese",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
    }),
    defineField({
      name: "image",
      title: "Fotka",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "bio",
      title: "O autorovi",
      type: "array",
      of: [
        {
          title: "Block",
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
    },
  },
})
