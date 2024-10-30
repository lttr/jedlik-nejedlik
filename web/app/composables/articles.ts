import { readItem, readItems } from "@directus/sdk"
import { getImageUrl } from "~/utils/directus"
import { directus } from "./directus"

export interface Article {
  cover: string
  perex: string
  title: string
  image: string
  id: number
}

export async function useArticle(slug: string) {
  return await useAsyncData(
    `article-${slug}`,
    async () => {
      return await directus.request(readItem("articles", slug))
    },
    {
      transform: (input) => {
        return {
          id: input.id,
          title: input.title,
          text: input.perex,
          image: getImageUrl(input.cover),
          tags: [
            { text: "jedlík", to: "/" },
            { text: "nejedlík", to: "/" },
          ],
          to: `/clanky/${input.id}`,
        }
      },
    },
  )
}

export async function useArticles() {
  return useAsyncData(
    "articles",
    async () => {
      return await directus.request(
        readItems("articles", {
          fields: ["id", "title", "perex", "cover"],
          filter: {
            status: { _eq: "published" },
          },
        }),
      )
    },
    {
      transform: (input) => {
        return input.map((item) => {
          return {
            id: item.id,
            title: item.title,
            text: item.perex,
            image: getImageUrl(item.cover),
            tags: [
              { text: "jedlík", to: "/" },
              { text: "nejedlík", to: "/" },
            ],
            to: `/clanky/${item.id}`,
          }
        })
      },
    },
  )
}
