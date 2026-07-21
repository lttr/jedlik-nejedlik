import { createDirectus, rest } from "@directus/sdk"
import type { DirectusClient, RestClient } from "@directus/sdk"
import type { Schema } from "../types/directus"

// Pure factory — no Vue/Nitro APIs, usable from both app and server code.
export function createDirectusClient(url: string): DirectusClient<Schema> & RestClient<Schema> {
  return createDirectus<Schema>(url).with(rest())
}
