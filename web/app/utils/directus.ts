import { createDirectus, rest } from "@directus/sdk"
import type { Schema } from "./directus-schema"
import type { Url } from "~~/modules/safe-runtime-config/runtime/schema-kit"
import { directusUrlSchema } from "~~/server/runtime-config.schema"

// safe-runtime-config validates this at boot; parse here to mint the Url brand
// at the boundary so callers receive a Url, not a bare string. Cached — the
// runtime value can't change within a process.
let _url: Url | null = null
function directusUrl(): Url {
  return (_url ??= directusUrlSchema.parse(useRuntimeConfig().public.directusUrl))
}

function createClient() {
  return createDirectus<Schema>(directusUrl()).with(rest())
}

let _client: ReturnType<typeof createClient> | null = null

export function getDirectusClient(): ReturnType<typeof createClient> {
  _client ??= createClient()
  return _client
}

export function getImageUrl(cover: string): string {
  return `${directusUrl()}/assets/${cover}`
}
