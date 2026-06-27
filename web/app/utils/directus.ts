import { createDirectus, rest } from "@directus/sdk"
import type { Schema } from "./directus-schema"

function createClient() {
  return createDirectus<Schema>(useRuntimeConfig().public.directusUrl).with(rest())
}

let _client: ReturnType<typeof createClient> | null = null

export function getDirectusClient(): ReturnType<typeof createClient> {
  _client ??= createClient()
  return _client
}

export function getImageUrl(cover: string): string {
  return `${useRuntimeConfig().public.directusUrl}/assets/${cover}`
}
