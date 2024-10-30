import { readItem, readItems } from "@directus/sdk"
import { directus } from "./directus"
import { getImageUrl } from "~/utils/directus"
import type { Card } from "~/types/articles"

export interface Article {
  cover: string
  perex: string
  title: string
  image: string
  id: string
}

export async function useArticle(slug: string) {
  return await useAsyncData(
    `article-${slug}`,
    async () => {
      return await directus.request(readItem("articles", slug))
    },
    {
      transform: (input): Omit<Card, "headingLevel"> => {
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

export const useArticles = () => {
  return useAsyncData("articles", async () => {
    const result = await directus.request(
      readItems("articles", {
        fields: ["id", "title", "perex", "cover"],
        filter: {
          status: { _eq: "published" },
        },
      }),
    )
    return result
  })
}
