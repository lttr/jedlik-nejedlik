import { readItem, readItems } from "@directus/sdk"
import { directus } from "./directus"

export interface Article {
  cover: string
  perex: string
  title: string
  image: string
  id: number
}

export interface ArticleView {
  id: number
  image: string
  tags: { text: string; to: string }[]
  text: string
  title: string
  to: string
}

export function useArticle(slug: string): ReturnType<typeof useAsyncData<ArticleView>> {
  return useAsyncData(
    `article-${slug}`,
    async () => {
      return directus.request(readItem("articles", slug))
    },
    {
      transform: (input) => {
        return {
          id: input.id,
          image: getImageUrl(input.cover),
          tags: [
            { text: "jedlík", to: "/" },
            { text: "nejedlík", to: "/" },
          ],
          text: input.perex,
          title: input.title,
          to: `/clanky/${input.id}`,
        }
      },
    },
  )
}

export function useArticles(): ReturnType<typeof useAsyncData<ArticleView[]>> {
  return useAsyncData(
    "articles",
    async () => {
      return directus.request(
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
