import { defineField, defineType } from "sanity"

export default defineType({
  name: "post",
  title: "Příspěvek",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titulek",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Titulek v URL adrese",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: { type: "author" },
    }),
    defineField({
      name: "mainImage",
      title: "Hlavní obrázek",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "categories",
      title: "Kategorie",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
    defineField({
      name: "publishedAt",
      title: "Publikováno",
      type: "datetime",
    }),
    defineField({
      name: "body",
      title: "Text",
      type: "blockContent",
    }),
  ],

  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
    },
    prepare(selection) {
      const { author } = selection
      return { ...selection, subtitle: author && `by ${author}` }
    },
  },
})
