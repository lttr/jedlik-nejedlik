import { readItem, readItems } from "@directus/sdk"
import type { AsyncData, NuxtError } from "nuxt/app"

// Wire shape of `articles` collection in Directus. Used to type the SDK client
// at the Schema level.
export interface ArticleCollection {
  id: number
  title: string
  perex: string
  cover: string
  status: string
}

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

export async function useArticle(
  slug: string,
): Promise<AsyncData<ArticleView | undefined, NuxtError | undefined>> {
  const key = `article-${slug}`
  const result = useAsyncData(
    key,
    async () => getDirectusClient().request(readItem("articles", slug)),
    {
      transform: (input) => ({
        id: input.id,
        image: getImageUrl(input.cover),
        tags: [
          { text: "jedlík", to: "/" },
          { text: "nejedlík", to: "/" },
        ],
        text: input.perex,
        title: input.title,
        to: `/clanky/${input.id}`,
      }),
    },
  )
  watchAsyncDataError(key, result.error)
  return result
}

export async function useArticles(): Promise<
  AsyncData<ArticleView[] | undefined, NuxtError | undefined>
> {
  const key = "articles"
  const result = useAsyncData(
    key,
    async () =>
      getDirectusClient().request(
        readItems("articles", {
          fields: ["id", "title", "perex", "cover"],
          filter: {
            status: { _eq: "published" },
          },
        }),
      ),
    {
      transform: (input) =>
        input.map((item) => ({
          id: item.id,
          title: item.title,
          text: item.perex,
          image: getImageUrl(item.cover),
          tags: [
            { text: "jedlík", to: "/" },
            { text: "nejedlík", to: "/" },
          ],
          to: `/clanky/${item.id}`,
        })),
    },
  )
  watchAsyncDataError(key, result.error)
  return result
}
